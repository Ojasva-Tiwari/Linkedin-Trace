import {
  EvidenceItem,
  MyPathComparison,
  ResearchSet,
  TimelineEvent,
  TraceProfile,
} from '@shared/index';
import { extensionStorage } from './chrome-storage';

const DB_NAME = 'trace_local_db';
const DB_VERSION = 2;

export const STORES = {
  PROFILES: 'profiles',
  EVIDENCE: 'evidence',
  RESEARCH_SETS: 'research_sets',
  MYPATH_COMPARISONS: 'mypath_comparisons',
  TIMELINE: 'timeline',
} as const;

/**
 * Local IndexedDB database manager for TRACE.
 * Enforces local-first data storage with zero cloud dependencies.
 */
export class TraceIndexedDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      // Fallback for non-browser / SSR environments
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Profiles store
        if (!db.objectStoreNames.contains(STORES.PROFILES)) {
          const profileStore = db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
          profileStore.createIndex('sourceUrl', 'sourceUrl', { unique: false });
          profileStore.createIndex('capturedAt', 'capturedAt', { unique: false });
        }

        // Evidence store
        if (!db.objectStoreNames.contains(STORES.EVIDENCE)) {
          const evidenceStore = db.createObjectStore(STORES.EVIDENCE, { keyPath: 'id' });
          evidenceStore.createIndex('factState', 'factState', { unique: false });
          evidenceStore.createIndex('extractedAt', 'extractedAt', { unique: false });
        }

        // Research Sets store
        if (!db.objectStoreNames.contains(STORES.RESEARCH_SETS)) {
          const researchStore = db.createObjectStore(STORES.RESEARCH_SETS, { keyPath: 'id' });
          researchStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // MyPath Comparisons store
        if (!db.objectStoreNames.contains(STORES.MYPATH_COMPARISONS)) {
          const myPathStore = db.createObjectStore(STORES.MYPATH_COMPARISONS, { keyPath: 'id' });
          myPathStore.createIndex('userProfileId', 'userProfileId', { unique: false });
        }

        // Timeline store
        if (!db.objectStoreNames.contains(STORES.TIMELINE)) {
          db.createObjectStore(STORES.TIMELINE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Profiles ---
  async saveProfile(profile: TraceProfile): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PROFILES, 'readwrite');
      tx.objectStore(STORES.PROFILES).put(profile);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getProfile(id: string): Promise<TraceProfile | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PROFILES, 'readonly');
      const req = tx.objectStore(STORES.PROFILES).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllProfiles(): Promise<TraceProfile[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PROFILES, 'readonly');
      const req = tx.objectStore(STORES.PROFILES).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // --- Evidence ---
  async saveEvidence(evidence: EvidenceItem): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.EVIDENCE, 'readwrite');
      tx.objectStore(STORES.EVIDENCE).put(evidence);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getEvidenceBatch(ids: string[]): Promise<EvidenceItem[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.EVIDENCE, 'readonly');
      const store = tx.objectStore(STORES.EVIDENCE);
      const items: EvidenceItem[] = [];
      let completed = 0;

      if (ids.length === 0) {
        resolve([]);
        return;
      }

      ids.forEach((id) => {
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result) items.push(req.result);
          completed++;
          if (completed === ids.length) resolve(items);
        };
        req.onerror = () => reject(req.error);
      });
    });
  }

  // --- Research Sets ---
  async saveResearchSet(set: ResearchSet): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.RESEARCH_SETS, 'readwrite');
      tx.objectStore(STORES.RESEARCH_SETS).put(set);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAllResearchSets(): Promise<ResearchSet[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.RESEARCH_SETS, 'readonly');
      const req = tx.objectStore(STORES.RESEARCH_SETS).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // --- My Path ---
  async saveComparison(comparison: MyPathComparison): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MYPATH_COMPARISONS, 'readwrite');
      tx.objectStore(STORES.MYPATH_COMPARISONS).put(comparison);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getComparison(id: string): Promise<MyPathComparison | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MYPATH_COMPARISONS, 'readonly');
      const req = tx.objectStore(STORES.MYPATH_COMPARISONS).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  // --- Timeline Events ---
  async saveTimelineEvents(events: TimelineEvent[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TIMELINE, 'readwrite');
      const store = tx.objectStore(STORES.TIMELINE);
      events.forEach((ev) => store.put(ev));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getTimelineForProfile(_profileId: string): Promise<TimelineEvent[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TIMELINE, 'readonly');
      const req = tx.objectStore(STORES.TIMELINE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getEvidenceForProfile(profileId: string): Promise<EvidenceItem[]> {
    const profile = await this.getProfile(profileId);
    if (!profile || !profile.evidenceIds || profile.evidenceIds.length === 0) {
      return [];
    }
    return this.getEvidenceBatch(profile.evidenceIds);
  }

  // --- Profile State Helpers ---
  async getActiveProfileId(): Promise<string | undefined> {
    return extensionStorage.getActiveProfileId();
  }

  async setActiveProfileId(profileId: string): Promise<void> {
    return extensionStorage.setActiveProfileId(profileId);
  }
}

export const localDB = new TraceIndexedDB();
export const traceStorage = localDB;
