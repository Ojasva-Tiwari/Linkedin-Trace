/**
 * TRACE - Layout Context
 * 
 * Manages multi-size dashboard workspace state (Expanded vs Compact).
 * Persists user preference via chrome.storage.local with localStorage fallback.
 * Survives extension reopen and browser restarts.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type LayoutMode = 'expanded' | 'compact';

interface LayoutContextType {
  layoutMode: LayoutMode;
  isCompact: boolean;
  toggleLayoutMode: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
}

const STORAGE_KEY = 'trace_layout_mode';
const DEFAULT_MODE: LayoutMode = 'expanded';

const LayoutContext = createContext<LayoutContextType>({
  layoutMode: DEFAULT_MODE,
  isCompact: false,
  toggleLayoutMode: () => {},
  setLayoutMode: () => {},
});

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layoutMode, setModeState] = useState<LayoutMode>(DEFAULT_MODE);

  // Initialize from chrome.storage.local or localStorage
  useEffect(() => {
    let mounted = true;

    async function loadPreference() {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          const result = await new Promise<{ [key: string]: any }>((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (res) => resolve(res || {}));
          });
          if (mounted && (result[STORAGE_KEY] === 'expanded' || result[STORAGE_KEY] === 'compact')) {
            setModeState(result[STORAGE_KEY] as LayoutMode);
            return;
          }
        }

        // LocalStorage fallback
        if (typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (mounted && (stored === 'expanded' || stored === 'compact')) {
            setModeState(stored as LayoutMode);
          }
        }
      } catch (err) {
        console.warn('[TRACE Layout] Error reading layout preference:', err);
      }
    }

    loadPreference();
    return () => {
      mounted = false;
    };
  }, []);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setModeState(mode);
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ [STORAGE_KEY]: mode });
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch (err) {
      console.warn('[TRACE Layout] Error saving layout preference:', err);
    }
  }, []);

  const toggleLayoutMode = useCallback(() => {
    setLayoutMode(layoutMode === 'expanded' ? 'compact' : 'expanded');
  }, [layoutMode, setLayoutMode]);

  const value = {
    layoutMode,
    isCompact: layoutMode === 'compact',
    toggleLayoutMode,
    setLayoutMode,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export function useLayoutMode(): LayoutContextType {
  return useContext(LayoutContext);
}
