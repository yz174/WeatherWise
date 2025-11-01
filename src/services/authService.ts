// Authentication service for Firebase Auth operations
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

/**
 * Sign in with Google OAuth
 * @returns Promise with user credentials
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful:');
    console.log('  UID:', result.user.uid);
    console.log('  Email:', result.user.email);
    console.log('  Is new user:', result.user.metadata.creationTime === result.user.metadata.lastSignInTime);
    
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
      },
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Sign out the current user
 * @returns Promise indicating success or failure
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Set up authentication state listener
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const setupAuthListener = (
  callback: (user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
  } | null) => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      console.log('Auth state changed - User signed in:');
      console.log('  UID:', user.uid);
      console.log('  Email:', user.email);
      console.log('  Display Name:', user.displayName);
      
      callback({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      });
    } else {
      console.log('Auth state changed - User signed out');
      callback(null);
    }
  });
};
