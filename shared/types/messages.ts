import { TraceProfile } from './profile';
import { EvidenceItem } from './evidence';

/**
 * Valid extension message actions.
 * All capture flows require explicit USER_TRIGGERED intent.
 */
export type ExtensionMessageAction =
  | 'TRIGGER_PAGE_CAPTURE'
  | 'PAGE_CAPTURE_RESPONSE'
  | 'GET_CAPTURE_STATUS'
  | 'OPEN_SIDE_PANEL'
  | 'PING';

/**
 * Payload sent from Side Panel / UI to Content Script / Service Worker to request capture.
 */
export interface TriggerPageCapturePayload {
  sourceUrl: string;
  userInitiated: true; // Strict guard: Must be user initiated
  timestamp: string;
}

/**
 * Raw capture package sent back from Content Script.
 */
export interface RawCapturePackage {
  url: string;
  pageTitle: string;
  capturedAt: string;
  rawHtmlSnapshot?: string;
  sanitizedDomText: string;
  metaTags: Record<string, string>;
}

/**
 * Top-level typed message envelope.
 */
export interface ExtensionMessage<T = unknown> {
  action: ExtensionMessageAction;
  payload: T;
  senderId?: string;
}

/**
 * Status responses.
 */
export interface CaptureStatusResponse {
  isCapturing: boolean;
  lastCapturedUrl?: string;
  lastCapturedAt?: string;
  error?: string;
}

export interface CaptureResultPayload {
  success: boolean;
  profile?: TraceProfile;
  evidenceItems?: EvidenceItem[];
  error?: string;
}
