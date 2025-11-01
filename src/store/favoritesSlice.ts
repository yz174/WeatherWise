// Redux slice for favorites management
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FavoritesState } from '../types/store.types';

const FAVORITES_STORAGE_KEY = 'weather_favorites';
const PINNED_STORAGE_KEY = 'weather_pinned';

// Load initial state from localStorage
const loadFavoritesFromStorage = (): FavoritesState => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const pinnedStored = localStorage.getItem(PINNED_STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      const pinnedParsed = pinnedStored ? JSON.parse(pinnedStored) : [];
      
      return {
        cityIds: Array.isArray(parsed.cityIds) ? parsed.cityIds : [],
        pinnedCityIds: Array.isArray(pinnedParsed) ? pinnedParsed : [],
        syncStatus: 'idle',
      };
    }
  } catch (error) {
    console.error('Failed to load favorites from localStorage:', error);
  }
  return {
    cityIds: [],
    pinnedCityIds: [],
    syncStatus: 'idle',
  };
};

// Save favorites to localStorage
const saveFavoritesToStorage = (cityIds: string[]): void => {
  try {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ cityIds })
    );
  } catch (error) {
    console.error('Failed to save favorites to localStorage:', error);
  }
};

// Save pinned cities to localStorage
const savePinnedToStorage = (pinnedCityIds: string[]): void => {
  try {
    localStorage.setItem(
      PINNED_STORAGE_KEY,
      JSON.stringify(pinnedCityIds)
    );
  } catch (error) {
    console.error('Failed to save pinned cities to localStorage:', error);
  }
};

const initialState: FavoritesState = loadFavoritesFromStorage();

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<string>) => {
      const cityId = action.payload;
      if (!state.cityIds.includes(cityId)) {
        state.cityIds.push(cityId);
        saveFavoritesToStorage(state.cityIds);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      const cityId = action.payload;
      state.cityIds = state.cityIds.filter((id) => id !== cityId);
      saveFavoritesToStorage(state.cityIds);
    },
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.cityIds = action.payload;
      // Only save to localStorage if not currently syncing from Firestore
      // This prevents overwriting cloud data with stale local data
      if (state.syncStatus !== 'syncing') {
        saveFavoritesToStorage(state.cityIds);
      }
    },
    togglePinned: (state, action: PayloadAction<string>) => {
      const cityId = action.payload;
      if (!state.pinnedCityIds) {
        state.pinnedCityIds = [];
      }
      
      if (state.pinnedCityIds.includes(cityId)) {
        state.pinnedCityIds = state.pinnedCityIds.filter((id: string) => id !== cityId);
      } else {
        state.pinnedCityIds.push(cityId);
      }
      savePinnedToStorage(state.pinnedCityIds);
    },
    setPinnedCities: (state, action: PayloadAction<string[]>) => {
      state.pinnedCityIds = action.payload;
      // Only save to localStorage if not currently syncing from Firestore
      if (state.syncStatus !== 'syncing') {
        savePinnedToStorage(state.pinnedCityIds);
      }
    },
    setSyncStatus: (
      state,
      action: PayloadAction<'idle' | 'syncing' | 'synced' | 'error'>
    ) => {
      state.syncStatus = action.payload;
    },
  },
});

export const { addFavorite, removeFavorite, setFavorites, togglePinned, setPinnedCities, setSyncStatus } =
  favoritesSlice.actions;
export default favoritesSlice.reducer;
