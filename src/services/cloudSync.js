import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, isConfigured } from './firebase';
import { getAllKeys } from '@/utils/storage';
import logger from '@/utils/logger';

/**
 * Cloud Sync Service
 * Handles authentication and data synchronization with Firebase
 */

// Current user state
let currentUser = null;
const authListeners = new Set();

/**
 * Initialize auth state listener
 */
export function initAuthListener() {
  if (!isConfigured || !auth) return;

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authListeners.forEach(listener => listener(user));

    if (user) {
      logger.info(`User signed in: ${user.email}`);
    } else {
      logger.info('User signed out');
    }
  });
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback) {
  authListeners.add(callback);
  // Call immediately with current state
  callback(currentUser);

  return () => authListeners.delete(callback);
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  if (!isConfigured || !auth || !googleProvider) {
    throw new Error('Firebase not configured');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    logger.info('Google sign in successful');
    return result.user;
  } catch (error) {
    logger.error('Google sign in failed:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut() {
  if (!isConfigured || !auth) return;

  try {
    await firebaseSignOut(auth);
    logger.info('Sign out successful');
  } catch (error) {
    logger.error('Sign out failed:', error);
    throw error;
  }
}

/**
 * Save all localStorage data to Firestore
 */
export async function saveToCloud() {
  if (!isConfigured || !db || !currentUser) {
    throw new Error('Not authenticated or Firebase not configured');
  }

  try {
    const keys = getAllKeys();
    const data = {};

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });

    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, {
      data,
      lastUpdated: serverTimestamp(),
      email: currentUser.email,
    });

    logger.info('Data saved to cloud successfully');
    return true;
  } catch (error) {
    logger.error('Failed to save to cloud:', error);
    throw error;
  }
}

/**
 * Load data from Firestore to localStorage
 */
export async function loadFromCloud() {
  if (!isConfigured || !db || !currentUser) {
    throw new Error('Not authenticated or Firebase not configured');
  }

  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      logger.info('No cloud data found');
      return null;
    }

    const { data, lastUpdated } = docSnap.data();

    // Restore data to localStorage
    let restored = 0;
    Object.entries(data).forEach(([key, value]) => {
      try {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, serialized);
        restored++;
      } catch (error) {
        logger.warn(`Failed to restore key: ${key}`, error);
      }
    });

    logger.info(`Loaded ${restored} items from cloud`);
    return {
      itemCount: restored,
      lastUpdated: lastUpdated?.toDate() || null,
    };
  } catch (error) {
    logger.error('Failed to load from cloud:', error);
    throw error;
  }
}

/**
 * Get cloud data info without loading
 */
export async function getCloudDataInfo() {
  if (!isConfigured || !db || !currentUser) {
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      return null;
    }

    const { data, lastUpdated } = docSnap.data();
    return {
      itemCount: Object.keys(data || {}).length,
      lastUpdated: lastUpdated?.toDate() || null,
    };
  } catch (error) {
    logger.error('Failed to get cloud data info:', error);
    return null;
  }
}

/**
 * Check if cloud sync is available
 */
export function isCloudSyncAvailable() {
  return isConfigured;
}

export default {
  initAuthListener,
  onAuthChange,
  getCurrentUser,
  signInWithGoogle,
  signOut,
  saveToCloud,
  loadFromCloud,
  getCloudDataInfo,
  isCloudSyncAvailable,
};
