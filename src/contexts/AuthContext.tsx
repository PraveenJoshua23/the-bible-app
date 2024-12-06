'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserPreferences } from '@/app/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userPreferences: UserPreferences | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const loadUserPreferences = async (userId: string) => {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserPreferences(docSnap.data() as UserPreferences);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await loadUserPreferences(user.uid);
      } else {
        setUserPreferences(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const initialPreferences: UserPreferences = {
          favorites: {
            versions: [],
            passages: []
          },
          highlights: {},
          settings: {
            showVerseNumbers: true,
            font: 'sans',
            theme: 'light',
            verseDisplay: 'paragraph',
            fontSize: 'medium'
          }
        };
        
        await setDoc(userRef, {
          email: result.user.email,
          name: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
          ...initialPreferences
        });
        
        setUserPreferences(initialPreferences);
      }
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const signOut = () => auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, userPreferences, signInWithGoogle, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);