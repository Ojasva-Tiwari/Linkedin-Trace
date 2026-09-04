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

// Helper to identify the relevant target web tab (skipping extension/internal pages)
function getRelevantTab(callback: (tab: chrome.tabs.Tab | undefined) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (
      activeTab &&
      activeTab.url &&
      activeTab.url.includes('linkedin.com/in/')
    ) {
      callback(activeTab);
      return;
    }

    // If active tab is the side panel itself, internal, or non-linkedin, find the active linkedin web tab
    chrome.tabs.query({}, (allTabs) => {
      const linkedinTab = allTabs.find((t) => t.url && t.url.includes('linkedin.com/in/'));
      if (linkedinTab) {
        callback(linkedinTab);
        return;
      }
      const anyWebTab = allTabs.find(
        (t) =>
          t.url &&
          !t.url.startsWith('chrome-extension://') &&
          !t.url.startsWith('edge://') &&
          !t.url.startsWith('chrome://') &&
          !t.url.startsWith('about:')
      );
      callback(anyWebTab || activeTab);
    });
  });
}

function ensureContentScriptAndSend(
  tabId: number,
  msg: any,
  sendResponse: (resp: any) => void
) {
  chrome.tabs.sendMessage(tabId, msg, (resp) => {
    if (chrome.runtime.lastError || !resp) {
      if (chrome.scripting) {
        chrome.scripting.executeScript(
          {
            target: { tabId },
            files: ['content-script.js'],
          },
          () => {
            if (chrome.runtime.lastError) {
              sendResponse({
                success: false,
                error: chrome.runtime.lastError.message,
              });
              return;
            }
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, msg, (retryResp) => {
                if (chrome.runtime.lastError) {
                  sendResponse({
                    success: false,
                    error: chrome.runtime.lastError.message,
                  });
                } else {
                  sendResponse(retryResp);
                }
              });
            }, 100);
          }
        );
        return;
      }
      sendResponse({
        success: false,
        error: chrome.runtime.lastError?.message || 'Content script unavailable',
      });
      return;
    }
    sendResponse(resp);
  });
}

// Listener for extension messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[TRACE Background] Received message:', message.action, 'from:', sender.id || 'internal');

  switch (message.action) {
    case 'PING':
      sendResponse({ status: 'ok', timestamp: new Date().toISOString() });
      return false;

    case 'DETECT_ACTIVE_TAB_PROFILE': {
      getRelevantTab((targetTab) => {
        if (!targetTab?.id || !targetTab.url) {
          sendResponse({ success: false, isProfile: false, error: 'No active web tab found' });
          return;
        }

        const url = targetTab.url;
        if (!url.includes('linkedin.com/in/')) {
          sendResponse({ success: true, isProfile: false, url });
          return;
        }

        ensureContentScriptAndSend(
          targetTab.id,
          { action: 'DETECT_LINKEDIN_PROFILE' },
          (resp) => {
            if (!resp || !resp.success) {
              const canonicalId = url.match(/\/in\/([^/?#]+)/)?.[1];
              sendResponse({
                success: true,
                isProfile: true,
                url,
                canonicalIdentifier: canonicalId,
                fullName: targetTab.title?.split('|')[0]?.trim() || canonicalId,
              });
              return;
            }
            sendResponse({ ...resp.data, success: true, isProfile: true, url });
          }
        );
      });
      return true; // Keep channel open
    }

    case 'EXTRACT_ACTIVE_PROFILE': {
      getRelevantTab((targetTab) => {
        if (!targetTab?.id) {
          sendResponse({ success: false, error: 'No active web tab found' });
          return;
        }

        ensureContentScriptAndSend(
          targetTab.id,
          { action: 'EXTRACT_LINKEDIN_PROFILE' },
          (resp) => {
            sendResponse(resp);
          }
        );
      });
      return true;
    }

    case 'TRIGGER_PAGE_CAPTURE': {
      // Legacy fallback
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab?.id) {
          sendResponse({ success: false, error: 'No active tab found.' });
          return;
        }

        chrome.tabs.sendMessage(
          activeTab.id,
          { action: 'EXTRACT_LINKEDIN_PROFILE' },
          (response) => {
            if (chrome.runtime.lastError) {
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
      return true;
    }

    default:
      console.log('[TRACE Background] Unhandled action:', message.action);
      return false;
  }
});
