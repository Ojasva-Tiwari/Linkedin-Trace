import { AIProviderConfig } from '@ai/index';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  developerMode: boolean;
  autoOpenSidePanel: boolean;
}

export interface ExtensionSettings {
  activeProfileId?: string;
  myProfileId?: string; // User's own canonical profile for My Path
  aiConfig: AIProviderConfig;
  preferences: UserPreferences;
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  aiConfig: {
    type: 'stub',
  },
  preferences: {
    theme: 'dark',
    developerMode: false,
    autoOpenSidePanel: true,
  },
};

const SETTINGS_KEY = 'trace_settings';

/**
 * Storage adapter for lightweight settings and state using chrome.storage.
 * Includes graceful localStorage fallback for browser dev/testing environments.
 */
export class ChromeStorageAdapter {
  private hasChromeStorage(): boolean {
    return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
  }

  async getSettings(): Promise<ExtensionSettings> {
    if (this.hasChromeStorage()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([SETTINGS_KEY], (result) => {
          resolve(result[SETTINGS_KEY] ? { ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] } : DEFAULT_SETTINGS);
        });
      });
    }

    // Local development fallback
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  }

  async saveSettings(settings: Partial<ExtensionSettings>): Promise<void> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    if (this.hasChromeStorage()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [SETTINGS_KEY]: updated }, () => resolve());
      });
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }

  async getMyProfileId(): Promise<string | undefined> {
    const settings = await this.getSettings();
    return settings.myProfileId;
  }

  async setMyProfileId(profileId: string): Promise<void> {
    await this.saveSettings({ myProfileId: profileId });
  }

  async getActiveProfileId(): Promise<string | undefined> {
    const settings = await this.getSettings();
    return settings.activeProfileId;
  }

  async setActiveProfileId(profileId: string): Promise<void> {
    await this.saveSettings({ activeProfileId: profileId });
  }
}

export const extensionStorage = new ChromeStorageAdapter();
