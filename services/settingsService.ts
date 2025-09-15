import { Settings } from '../types';

const SETTINGS_KEY = 'inventory_settings';

const defaultSettings: Settings = {
  exchangeRateUSD_ETB: 115,
};

export const settingsService = {
  getSettings: async (): Promise<Settings> => {
    try {
        const settingsJson = localStorage.getItem(SETTINGS_KEY);
        return settingsJson ? JSON.parse(settingsJson) : defaultSettings;
    } catch (e) {
        console.error("Could not fetch settings, returning default.", e);
        return defaultSettings;
    }
  },

  saveSettings: async (settings: Settings): Promise<Settings> => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  },
};
