// Middleware for syncing Redux state with Firestore
import type { Middleware } from '@reduxjs/toolkit';
import {
  saveFavoritesToFirestore,
  saveSettingsToFirestore,
} from '../services/firestoreService';
import { setSyncStatus } from './favoritesSlice';

/**
 * Middleware that syncs favorites and settings to Firestore
 * when authenticated users make changes
 */
export const firestoreMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    // Get current state after action is processed
    const state = store.getState();
    const { user, isAuthenticated } = state.auth;

    // Only sync if user is authenticated
    if (!isAuthenticated || !user) {
      return result;
    }

    // Sync favorites when they change
    if (
      typeof action === 'object' &&
      action !== null &&
      'type' in action &&
      (action.type === 'favorites/addFavorite' ||
        action.type === 'favorites/removeFavorite' ||
        action.type === 'favorites/setFavorites' ||
        action.type === 'favorites/togglePinned')
    ) {
      console.log('Firestore Middleware - Action detected:', action.type);
      console.log('  User authenticated:', isAuthenticated);
      console.log('  User UID:', user?.uid);
      console.log('  Current sync status:', state.favorites.syncStatus);
      
      // Don't sync if we're currently loading from Firestore
      // (to avoid circular syncing)
      if (state.favorites.syncStatus === 'syncing') {
        console.log('  Skipping sync - already syncing');
        return result;
      }

      console.log('  Triggering Firestore sync...');
      store.dispatch(setSyncStatus('syncing'));

      saveFavoritesToFirestore(
        user.uid,
        state.favorites.cityIds,
        state.favorites.pinnedCityIds
      )
        .then((response) => {
          if (response.success) {
            console.log('  Firestore sync successful');
            store.dispatch(setSyncStatus('synced'));
          } else {
            console.error('Failed to sync favorites:', response.error);
            store.dispatch(setSyncStatus('error'));
          }
        })
        .catch((error) => {
          console.error('Error syncing favorites:', error);
          store.dispatch(setSyncStatus('error'));
        });
    }

    // Sync settings when they change
    if (
      typeof action === 'object' &&
      action !== null &&
      'type' in action &&
      action.type === 'settings/setTemperatureUnit'
    ) {
      saveSettingsToFirestore(user.uid, state.settings)
        .then((response) => {
          if (!response.success) {
            console.error('Failed to sync settings:', response.error);
          }
        })
        .catch((error) => {
          console.error('Error syncing settings:', error);
        });
    }

    return result;
  };
