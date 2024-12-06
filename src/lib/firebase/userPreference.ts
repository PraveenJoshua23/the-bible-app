import { db } from './config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { UserPreferences } from '@/app/types/user';

export const getUserPreferences = async (userId: string) => {
  if (!db) {
    throw new Error('Firestore instance is not initialized');
  }
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as UserPreferences : null;
};

export const updateUserPreferences = async (
  userId: string, 
  preferences: Partial<UserPreferences>
) => {
    if (!db) {
    throw new Error('Firestore instance is not initialized');
    }
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, preferences);
};

export const toggleFavoriteVersion = async (
  userId: string, 
  versionId: string
) => {
    if (!db) {
        throw new Error('Firestore instance is not initialized');
      }
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const favorites = userDoc.data()?.favorites?.versions || [];
  
  const updated = favorites.includes(versionId)
    ? favorites.filter((id: string) => id !== versionId)
    : [...favorites, versionId];
    
  await updateDoc(userRef, {
    'favorites.versions': updated
  });
};

export const addBookmark = async (
  userId: string,
  passage: UserPreferences['favorites']['passages'][0]
) => {
    if (!db) {
        throw new Error('Firestore instance is not initialized');
      }
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const bookmarks = userDoc.data()?.favorites?.passages || [];
  
  await updateDoc(userRef, {
    'favorites.passages': [...bookmarks, passage]
  });
};

export const addHighlight = async (
  userId: string,
  passageId: string,
  highlight: UserPreferences['highlights'][string][0]
) => {
    if (!db) {
        throw new Error('Firestore instance is not initialized');
      }
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const highlights = userDoc.data()?.highlights?.[passageId] || [];
  
  await updateDoc(userRef, {
    [`highlights.${passageId}`]: [...highlights, highlight]
  });
};