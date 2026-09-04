/**
 * TRACE Content Script
 * 
 * Automatically responds to profile detection and visible DOM extraction requests.
 * Complies strictly with epistemic ground rules:
 * - Reads only visible, rendered session content.
 * - Does not perform aggressive background crawling.
 * - Attaches DOM selectors and snippet anchors.
 */

import { detectLinkedInProfile, extractLinkedInProfileFromDom } from '../extraction/linkedin-dom-extractor';

console.log('[TRACE Content Script] Active on page:', window.location.href);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const action = message.action || message.type;

  switch (action) {
    case 'DETECT_PROFILE':
    case 'DETECT_LINKEDIN_PROFILE': {
      try {
        const detection = detectLinkedInProfile();
        sendResponse({ success: true, data: detection });
      } catch (err) {
        sendResponse({
          success: false,
          error: err instanceof Error ? err.message : 'Detection error',
        });
      }
      return true;
    }

    case 'EXTRACT_PROFILE':
    case 'EXTRACT_LINKEDIN_PROFILE': {
      try {
        const rawProfile = extractLinkedInProfileFromDom();
        if (!rawProfile) {
          sendResponse({
            success: false,
            error: 'Current page is not a valid or rendered LinkedIn profile.',
          });
          return true;
        }

        sendResponse({
          success: true,
          data: rawProfile,
        });
      } catch (err) {
        console.error('[TRACE Content Script] Extraction error:', err);
        sendResponse({
          success: false,
          error: err instanceof Error ? err.message : 'Extraction failed',
        });
      }
      return true;
    }

    case 'CAPTURE_PAGE':
    case 'CAPTURE_CURRENT_PAGE': {
      // Legacy fallback
      try {
        const rawProfile = extractLinkedInProfileFromDom();
        sendResponse({
          success: true,
          data: rawProfile,
        });
      } catch (err) {
        sendResponse({
          success: false,
          error: err instanceof Error ? err.message : 'Capture failed',
        });
      }
      return true;
    }

    default:
      return false;
  }
});

