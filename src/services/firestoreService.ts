// Firestore service for syncing user data to cloud storage
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { SettingsState } from '../types/store.types';

/**
 * Save user favorites to Firestore
 * @param userId User's unique ID
 * @param cityIds Array of favorite city IDs
 * @param pinnedCityIds Array of pinned city IDs
 * @returns Promise indicating success or failure
 */
export const saveFavoritesToFirestore = async (
  userId: string,
  cityIds: string[],
  pinnedCityIds: string[] = []
) => {
  try {
    console.log('Saving to Firestore - userId:', userId);
    console.log('Saving favorites:', cityIds);
    console.log('Saving pinned cities:', pinnedCityIds);
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, {
        favorites: cityIds,
        pinnedCityIds: pinnedCityIds,
        lastSync: serverTimestamp(),
      });
      console.log('Updated existing Firestore document');
    } else {
      // Create new document
      await setDoc(userDocRef, {
        favorites: cityIds,
        pinnedCityIds: pinnedCityIds,
        settings: {
          temperatureUnit: 'celsius',
        },
        lastSync: serverTimestamp(),
      });
      console.log('Created new Firestore document');
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving favorites to Firestore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Load user favorites from Firestore
 * @param userId User's unique ID
 * @returns Promise with favorites array or error
 */
export const loadFavoritesFromFirestore = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        success: true,
        favorites: (data.favorites as string[]) || [],
        pinnedCityIds: (data.pinnedCityIds as string[]) || [],
      };
    } else {
      // User document doesn't exist yet
      return {
        success: true,
        favorites: [],
        pinnedCityIds: [],
      };
    }
  } catch (error) {
    console.error('Error loading favorites from Firestore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      favorites: [],
      pinnedCityIds: [],
    };
  }
};

/**
 * Save user settings to Firestore
 * @param userId User's unique ID
 * @param settings User settings object
 * @returns Promise indicating success or failure
 */
export const saveSettingsToFirestore = async (
  userId: string,
  settings: SettingsState
) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, {
        settings: settings,
        lastSync: serverTimestamp(),
      });
    } else {
      // Create new document
      await setDoc(userDocRef, {
        favorites: [],
        settings: settings,
        lastSync: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving settings to Firestore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Load user settings from Firestore
 * @param userId User's unique ID
 * @returns Promise with settings object or error
 */
export const loadSettingsFromFirestore = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        success: true,
        settings: (data.settings as SettingsState) || {
          temperatureUnit: 'celsius' as const,
        },
      };
    } else {
      // User document doesn't exist yet, return defaults
      return {
        success: true,
        settings: {
          temperatureUnit: 'celsius' as const,
        },
      };
    }
  } catch (error) {
    console.error('Error loading settings from Firestore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      settings: {
        temperatureUnit: 'celsius' as const,
      },
    };
  }
};
