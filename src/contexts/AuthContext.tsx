import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'receiver' | 'admin';
  verified: boolean;
  profileComplete: boolean;
  profilePicture?: string;
  phone?: string;
  location?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  organizationName?: string;
  category?: 'ngo' | 'orphanage' | 'old-age-home' | 'shelter' | 'volunteer-group' | 'community-kitchen';
  documents?: string[];
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, role: 'donor' | 'receiver') => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          id: userData.id,
          name: userData.name || userData.email?.split('@')[0] || 'User',
          email: userData.email,
          role: userData.role || 'donor',
          verified: userData.verified || false,
          profileComplete: userData.profileComplete || false,
          profilePicture: userData.profilePicture,
          phone: userData.phone,
          location: userData.location,
          organizationName: userData.organizationName,
          category: userData.category,
          documents: userData.documents,
          createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
        setUser(user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    }
  };

  const createUserProfile = async (firebaseUser: FirebaseUser, role: 'donor' | 'receiver' = 'donor') => {
    try {
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        profilePicture: firebaseUser.photoURL,
        role: role,
        verified: firebaseUser.emailVerified,
        profileComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      await fetchUserProfile(firebaseUser.uid);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await fetchUserProfile(result.user.uid);
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user) {
        // Check if user profile exists
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        
        if (!userDoc.exists()) {
          // Create new user profile
          await createUserProfile(result.user, 'donor');
        } else {
          await fetchUserProfile(result.user.uid);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Google login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, role: 'donor' | 'receiver') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (result.user) {
        await createUserProfile(result.user, role);
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('User already registered');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (profileData: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updateData = {
        name: profileData.name,
        phone: profileData.phone,
        organizationName: profileData.organizationName,
        category: profileData.category,
        location: profileData.location,
        profilePicture: profileData.profilePicture,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      };

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.id), updateData);
      
      // Update Firebase Auth profile if name or photo changed
      if (profileData.name || profileData.profilePicture) {
        await updateProfile(auth.currentUser!, {
          displayName: profileData.name || auth.currentUser!.displayName,
          photoURL: profileData.profilePicture || auth.currentUser!.photoURL,
        });
      }
      
      await fetchUserProfile(user.id);
    } catch (error: any) {
      setError(error.message || 'Profile update failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      register,
      logout,
      updateProfile: updateUserProfile,
      isLoading,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};