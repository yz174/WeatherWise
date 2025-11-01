// Service for syncing user data between Firestore and Redux
import type { AppDispatch } from '../store';
import {
  loadFavoritesFromFirestore,
  loadSettingsFromFirestore,
} from './firestoreService';
import { setFavorites, setPinnedCities, setSyncStatus } from '../store/favoritesSlice';
import { setSettings, setTemperatureUnit } from '../store/settingsSlice';

/**
 * Sync user data from Firestore to Redux on authentication
 * Prefers cloud data over local data to handle sync conflicts
 * @param userId User's unique ID
 * @param dispatch Redux dispatch function
 */
export const syncUserDataFromFirestore = async (
  userId: string,
  dispatch: AppDispatch
) => {
  try {
    dispatch(setSyncStatus('syncing'));

    // Load favorites and pinned cities from Firestore
    const favoritesResult = await loadFavoritesFromFirestore(userId);
    console.log('Loaded favorites from Firestore:', favoritesResult);
    
    if (favoritesResult.success) {
      // Prefer cloud data over local data
      const favorites = favoritesResult.favorites || [];
      const pinnedCityIds = favoritesResult.pinnedCityIds || [];
      
      console.log('Setting favorites:', favorites);
      console.log('Setting pinned cities:', pinnedCityIds);
      
      dispatch(setFavorites(favorites));
      dispatch(setPinnedCities(pinnedCityIds));
    }

    // Load settings from Firestore
    const settingsResult = await loadSettingsFromFirestore(userId);
    if (settingsResult.success && settingsResult.settings) {
      // Prefer cloud data over local data
      // Use setSettings to avoid triggering localStorage save
      dispatch(setSettings(settingsResult.settings));
    }

    dispatch(setSyncStatus('synced'));
    console.log('Successfully synced user data from Firestore');
  } catch (error) {
    console.error('Error syncing user data from Firestore:', error);
    dispatch(setSyncStatus('error'));
  }
};

/**
 * Clear local data when user signs out
 * This ensures that the next user doesn't see the previous user's data
 * @param dispatch Redux dispatch function
 */
export const clearUserDataOnSignOut = (dispatch: AppDispatch) => {
  console.log('Clearing user data on sign out');
  
  // Set sync status to 'syncing' to prevent localStorage saves during cleanup
  dispatch(setSyncStatus('syncing'));
  
  // Clear localStorage first to prevent it from being loaded on next login
  localStorage.removeItem('weather_favorites');
  localStorage.removeItem('weather_pinned');
  
  // Reset favorites to empty array
  dispatch(setFavorites([]));
  
  // Reset pinned cities to empty array
  dispatch(setPinnedCities([]));
  
  // Reset settings to defaults
  dispatch(setTemperatureUnit('celsius'));
  
  // Reset sync status to idle
  dispatch(setSyncStatus('idle'));
};
