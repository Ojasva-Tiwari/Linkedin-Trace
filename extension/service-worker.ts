/**
 * TRACE Background Service Worker (Manifest V3)
 *
 * Principles:
 * 1. Event-driven lifecycle (may be terminated by Chrome when idle).
 * 2. Strict user-triggered capture guard: Never performs automated background scraping or crawling.
 * 3. Coordinates side panel and content script communication.
 */

// Configure side panel behavior to open when user clicks the extension action icon
chrome.runtime.onInstalled.addListener(() => {
  console.log('[TRACE] Extension installed. Configuring side panel behavior.');
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn('[TRACE] Error setting side panel behavior:', err);
    });
  }
});

// Listener for extension messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[TRACE Background] Received message:', message.action, 'from:', sender.id || 'internal');

  switch (message.action) {
    case 'PING':
      sendResponse({ status: 'ok', timestamp: new Date().toISOString() });
      return false;

    case 'TRIGGER_PAGE_CAPTURE':
      // Verify user initiation flag
      if (!message.payload?.userInitiated) {
        console.error('[TRACE Background] Rejected capture: User initiation flag missing.');
        sendResponse({ success: false, error: 'Capture must be explicitly user-triggered.' });
        return false;
      }

      // Forward capture request to the active tab's content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab?.id) {
          sendResponse({ success: false, error: 'No active tab found.' });
          return;
        }

        chrome.tabs.sendMessage(
          activeTab.id,
          { action: 'CAPTURE_PAGE', payload: message.payload },
          (response) => {
            if (chrome.runtime.lastError) {
              console.warn('[TRACE Background] Tab message error:', chrome.runtime.lastError.message);
              sendResponse({
                success: false,
                error: `Content script error: ${chrome.runtime.lastError.message}`,
              });
              return;
            }
            sendResponse(response);
          }
        );
      });
      return true; // Keep message channel open for asynchronous response

    default:
      console.log('[TRACE Background] Unhandled action:', message.action);
      return false;
  }
});
