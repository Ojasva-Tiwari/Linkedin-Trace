/**
 * TRACE Content Script (Placeholder Skeleton)
 *
 * Principles:
 * 1. Passive listener: Does NOT execute background scraping or continuous DOM observation.
 * 2. User-triggered execution: Activates only when explicit 'CAPTURE_PAGE' message arrives.
 * 3. Parser abstraction: Detailed DOM parsing algorithms will be implemented in subsequent phases.
 */

console.log('[TRACE Content Script] Injected on LinkedIn. Awaiting user-triggered capture command.');

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'CAPTURE_PAGE') {
    console.log('[TRACE Content Script] Explicit user capture triggered for URL:', window.location.href);

    try {
      // Gather top-level metadata
      const metaTags: Record<string, string> = {};
      document.querySelectorAll('meta').forEach((meta) => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          metaTags[name] = content;
        }
      });

      // Basic sanitized text extraction placeholder (detailed parser to follow in next phase)
      const mainContent = document.querySelector('main') || document.body;
      const sanitizedText = (mainContent?.innerText || '').slice(0, 15000);

      const capturePackage = {
        url: window.location.href,
        pageTitle: document.title,
        capturedAt: new Date().toISOString(),
        sanitizedDomText: sanitizedText,
        metaTags,
      };

      sendResponse({
        success: true,
        data: capturePackage,
      });
    } catch (error) {
      console.error('[TRACE Content Script] Error during page capture:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown capture error',
      });
    }
  }

  return true;
});
