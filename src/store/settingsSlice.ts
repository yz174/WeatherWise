// Redux slice for settings management
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SettingsState } from '../types/store.types';

const SETTINGS_STORAGE_KEY = 'weather_settings';

// Load initial state from localStorage
const loadSettingsFromStorage = (): SettingsState => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        temperatureUnit: parsed.temperatureUnit || 'celsius',
      };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return {
    temperatureUnit: 'celsius',
  };
};

// Save settings to localStorage
const saveSettingsToStorage = (state: SettingsState): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
};

const initialState: SettingsState = loadSettingsFromStorage();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTemperatureUnit: (
      state,
      action: PayloadAction<'celsius' | 'fahrenheit'>
    ) => {
      state.temperatureUnit = action.payload;
      saveSettingsToStorage(state);
    },
    setSettings: (state, action: PayloadAction<SettingsState>) => {
      // Used for loading settings from Firestore without triggering localStorage save
      state.temperatureUnit = action.payload.temperatureUnit;
    },
  },
});

export const { setTemperatureUnit, setSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
