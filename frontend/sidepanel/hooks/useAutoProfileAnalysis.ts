/**
 * TRACE - useAutoProfileAnalysis Hook
 * 
 * Automatically detects LinkedIn profile pages in the active browser tab,
 * triggers visible DOM evidence extraction, normalizes the data into canonical Trace schemas,
 * and persists everything in local IndexedDB.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TraceProfile,
  EvidenceItem,
  TimelineEvent,
  CareerJourneySynthesis,
} from '@shared/index';
import { localDB } from '../../../storage/indexeddb';
import {
  SAMPLE_PROFILE,
  SAMPLE_EVIDENCE_ITEMS,
  SAMPLE_TIMELINE_EVENTS,
} from '../../../storage/sampleData';
import {
  ExtractedRawProfile,
  ExtractionStatus,
  ProfileDetectionResult,
} from '../../../extraction/types';
import { normalizeRawProfile } from '../../../extraction/profile-normalizer';
import {
  AIService,
  computeSynthesisInputHash,
  CareerJourneySynthesisInput,
} from '../../../ai/index';

export type SynthesisStatus = 'idle' | 'synthesizing' | 'ready' | 'unavailable';

interface ExtractedMessageResponse {
  success: boolean;
  data?: ExtractedRawProfile;
  error?: string;
}

export interface UseAutoProfileAnalysisReturn {
  status: ExtractionStatus;
  synthesisStatus: SynthesisStatus;
  synthesis: CareerJourneySynthesis | null;
  synthesisError: string | null;
  detection: ProfileDetectionResult | null;
  profile: TraceProfile | null;
  evidenceItems: EvidenceItem[];
  timelineEvents: TimelineEvent[];
  error: string | null;
  isLive: boolean;
  reanalyze: () => Promise<void>;
  resynthesize: (force?: boolean) => Promise<void>;
  loadSampleProfile: () => void;
  loadProfileById: (profileId: string) => Promise<void>;
}

export function useAutoProfileAnalysis(): UseAutoProfileAnalysisReturn {
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [synthesisStatus, setSynthesisStatus] = useState<SynthesisStatus>('idle');
  const [synthesis, setSynthesis] = useState<CareerJourneySynthesis | null>(null);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [detection, setDetection] = useState<ProfileDetectionResult | null>(null);
  const [profile, setProfile] = useState<TraceProfile | null>(null);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  const profileRef = useRef<TraceProfile | null>(null);
  profileRef.current = profile;
  const isExtractingRef = useRef(false);
  const isSynthesizingRef = useRef(false);
  const lastExtractedUrlRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const runSynthesis = useCallback(
    async (
      targetProfile: TraceProfile,
      evidence: EvidenceItem[],
      timeline: TimelineEvent[],
      force = false
    ) => {
      if (isSynthesizingRef.current) return;
      isSynthesizingRef.current = true;
      setSynthesisStatus('synthesizing');
      setSynthesisError(null);

      const input: CareerJourneySynthesisInput = {
        profile: targetProfile,
        evidence,
        timelineEvents: timeline,
        externalSources: targetProfile.externalSources || [],
        options: { forceRefresh: force },
      };

      const expectedHash = computeSynthesisInputHash(input);

      try {
        if (!force) {
          const cached = await localDB.getCareerSynthesis(targetProfile.id);
          if (cached && cached.inputHash === expectedHash) {
            setSynthesis(cached);
            setSynthesisStatus('ready');
            isSynthesizingRef.current = false;
            return;
          }
        }

        // Call provider abstraction
        const provider = AIService.getProvider();
        const synthesized = await provider.synthesizeCareerJourney(input);
        synthesized.inputHash = expectedHash;

        // Persist locally in IndexedDB
        await localDB.saveCareerSynthesis(synthesized);

        setSynthesis(synthesized);
        setSynthesisStatus('ready');
      } catch (err) {
        console.warn('[TRACE] Synthesis failed or unavailable:', err);
        setSynthesisStatus('unavailable');
        setSynthesisError(err instanceof Error ? err.message : 'Synthesis unavailable');
      } finally {
        isSynthesizingRef.current = false;
      }
    },
    []
  );

  const hydrateFromLocalDB = useCallback(
    async (savedProfile: TraceProfile) => {
      setProfile(savedProfile);
      try {
        const [evidence, timeline, cachedSynthesis] = await Promise.all([
          localDB.getEvidenceForProfile(savedProfile.id),
          localDB.getTimelineForProfile(savedProfile.id),
          localDB.getCareerSynthesis(savedProfile.id),
        ]);
        setEvidenceItems(evidence);
        setTimelineEvents(timeline);

        const expectedHash = computeSynthesisInputHash({
          profile: savedProfile,
          evidence,
          timelineEvents: timeline,
          externalSources: savedProfile.externalSources || [],
        });

        if (cachedSynthesis && cachedSynthesis.inputHash === expectedHash) {
          setSynthesis(cachedSynthesis);
          setSynthesisStatus('ready');
        } else {
          // Trigger fresh synthesis in background
          runSynthesis(savedProfile, evidence, timeline, false);
        }
      } catch (err) {
        console.warn('[TRACE] Error hydrating secondary items from local DB:', err);
      }
    },
    [runSynthesis]
  );


  const extractAndNormalize = useCallback(
    async (url: string, force = false) => {
      if (isExtractingRef.current) return;
      if (!force && lastExtractedUrlRef.current === url && profileRef.current) {
        return;
      }

      isExtractingRef.current = true;
      setStatus('analyzing');
      setError(null);

      try {
        const response: ExtractedMessageResponse = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'EXTRACT_ACTIVE_PROFILE' }, (resp) => {
            if (chrome.runtime.lastError) {
              resolve({
                success: false,
                error: chrome.runtime.lastError.message,
              });
            } else {
              resolve(resp || { success: false, error: 'Empty response' });
            }
          });
        });

        if (!response.success || !response.data) {
          console.warn('[TRACE] Visible extraction returned error or empty:', response.error);
          if (profileRef.current) {
            setStatus('ready');
          } else {
            setStatus('partial');
            setError(response.error || 'Partial or unrendered DOM content.');
          }
          return;
        }

        const raw = response.data;
        const normalized = normalizeRawProfile(raw);

        // Persist to local IndexedDB
        await localDB.saveNormalizedProfile(
          normalized.profile,
          normalized.evidenceItems,
          normalized.timelineEvents
        );

        lastExtractedUrlRef.current = url;
        setProfile(normalized.profile);
        setEvidenceItems(normalized.evidenceItems);
        setTimelineEvents(normalized.timelineEvents);
        setIsLive(true);
        setStatus(raw.completeness === 'full' ? 'ready' : 'partial');

        // Automatically trigger grounded career journey synthesis
        runSynthesis(
          normalized.profile,
          normalized.evidenceItems,
          normalized.timelineEvents,
          force
        );
      } catch (err) {
        console.error('[TRACE] Failed to extract & normalize profile:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setStatus(profileRef.current ? 'ready' : 'error');
      } finally {
        isExtractingRef.current = false;
      }
    },
    [runSynthesis]
  );


  // Main automatic detection workflow
  const detectActiveProfile = useCallback(
    async (force = false) => {
      if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
        // Standalone web mode: fallback to cached or sample data
        try {
          const stored = await localDB.getAllProfiles();
          if (stored.length > 0) {
            await hydrateFromLocalDB(stored[0]);
            setStatus('ready');
          } else {
            setProfile(SAMPLE_PROFILE);
            setEvidenceItems(SAMPLE_EVIDENCE_ITEMS);
            setTimelineEvents(SAMPLE_TIMELINE_EVENTS);
            setStatus('ready');
          }
        } catch {
          setProfile(SAMPLE_PROFILE);
          setEvidenceItems(SAMPLE_EVIDENCE_ITEMS);
          setTimelineEvents(SAMPLE_TIMELINE_EVENTS);
          setStatus('ready');
        }
        return;
      }

      // Chrome Extension environment
      chrome.runtime.sendMessage({ action: 'DETECT_ACTIVE_TAB_PROFILE' }, async (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[TRACE] Error detecting active tab:', chrome.runtime.lastError.message);
          setStatus('idle');
          return;
        }

        if (response?.isProfile && response.url) {
          const det: ProfileDetectionResult = {
            isProfile: true,
            url: response.url,
            canonicalIdentifier: response.canonicalIdentifier,
            fullName: response.fullName,
            headline: response.headline,
          };
          setDetection(det);
          setStatus('profile_detected');

          const targetProfileId = det.canonicalIdentifier ? `prof-${det.canonicalIdentifier}` : null;
          const currentProfile = profileRef.current;

          // If switching to a different profile: clear previous profile immediately
          if (targetProfileId && currentProfile && currentProfile.id !== targetProfileId) {
            setProfile(null);
            setEvidenceItems([]);
            setTimelineEvents([]);
            setSynthesis(null);
            setSynthesisStatus('idle');
            setSynthesisError(null);
            lastExtractedUrlRef.current = null;
          }

          // Check if already stored in local IndexedDB
          let cached: TraceProfile | null = null;
          try {
            cached = await localDB.getProfileByUrl(response.url);
            if (!cached && det.canonicalIdentifier) {
              cached = await localDB.getProfile(`prof-${det.canonicalIdentifier}`);
            }
          } catch (e) {
            console.warn('[TRACE] Error checking cached profile:', e);
          }

          if (cached) {
            await hydrateFromLocalDB(cached);
            setStatus('ready');
          }

          // Trigger automatic visible DOM extraction
          await extractAndNormalize(response.url, force);
        } else {
          // Tab is not a LinkedIn profile: only transition to idle if no active profile is loaded
          if (!profileRef.current) {
            setStatus('idle');
            setDetection(null);
            setProfile(null);
            setEvidenceItems([]);
            setTimelineEvents([]);
            setSynthesis(null);
            setSynthesisStatus('idle');
            setSynthesisError(null);
            lastExtractedUrlRef.current = null;
          }
        }
      });
    },
    [extractAndNormalize, hydrateFromLocalDB]
  );

  // Run detection on mount and attach debounced tab update / focus listeners
  useEffect(() => {
    detectActiveProfile();

    const triggerDebouncedDetection = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        detectActiveProfile();
      }, 250);
    };

    const handleFocus = () => {
      triggerDebouncedDetection();
    };

    window.addEventListener('focus', handleFocus);

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const handleTabUpdated = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
        if (changeInfo.status === 'complete' || changeInfo.url) {
          triggerDebouncedDetection();
        }
      };

      const handleTabActivated = () => {
        triggerDebouncedDetection();
      };

      chrome.tabs.onUpdated?.addListener(handleTabUpdated);
      chrome.tabs.onActivated?.addListener(handleTabActivated);

      return () => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        window.removeEventListener('focus', handleFocus);
        chrome.tabs.onUpdated?.removeListener(handleTabUpdated);
        chrome.tabs.onActivated?.removeListener(handleTabActivated);
      };
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      window.removeEventListener('focus', handleFocus);
    };
  }, [detectActiveProfile]);

  const loadSampleProfile = useCallback(async () => {
    setProfile(SAMPLE_PROFILE);
    setEvidenceItems(SAMPLE_EVIDENCE_ITEMS);
    setTimelineEvents(SAMPLE_TIMELINE_EVENTS);
    setIsLive(false);
    setStatus('ready');
    try {
      await localDB.saveNormalizedProfile(SAMPLE_PROFILE, SAMPLE_EVIDENCE_ITEMS, SAMPLE_TIMELINE_EVENTS);
      runSynthesis(SAMPLE_PROFILE, SAMPLE_EVIDENCE_ITEMS, SAMPLE_TIMELINE_EVENTS, false);
    } catch {
      // Ignore
    }
  }, [runSynthesis]);

  return {
    status,
    synthesisStatus,
    synthesis,
    synthesisError,
    detection,
    profile,
    evidenceItems,
    timelineEvents,
    error,
    isLive,
    reanalyze: () => extractAndNormalize(profileRef.current?.sourceUrl || '', true),
    resynthesize: (force = true) => {
      if (profileRef.current) {
        return runSynthesis(profileRef.current, evidenceItems, timelineEvents, force);
      }
      return Promise.resolve();
    },
    loadSampleProfile,
    loadProfileById: async (profileId: string) => {
      const p = await localDB.getProfile(profileId);
      if (p) {
        setIsLive(false);
        setStatus('ready');
        await hydrateFromLocalDB(p);
      }
    },
  };
}

