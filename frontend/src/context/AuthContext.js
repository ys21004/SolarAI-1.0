import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword as firebaseSignIn
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign in function
  const signIn = async (email, password) => {
    try {
      console.log('AuthContext: Signing in with email and password');
      setError(null);
      const userCredential = await firebaseSignIn(auth, email, password);
      console.log('AuthContext: Sign in successful');
      return userCredential.user;
    } catch (error) {
      console.error('AuthContext: Error signing in:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out');
      await firebaseSignOut(auth);
      
      // Clear any persisted auth data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('firebase:')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('firebase:')) {
          sessionStorage.removeItem(key);
        }
      });
      
      console.log('AuthContext: Sign out successful');
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
      setError(error.message);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        console.log('AuthContext: Auth state changed:', user ? `User logged in: ${user.email}` : 'No user');
        setCurrentUser(user);
        setLoading(false);
      },
      (err) => {
        console.error('AuthContext: Auth state error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 