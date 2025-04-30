import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('useAuth hook: Initializing...');
    
    // Force logout on initialization
    const forceLogout = async () => {
      try {
        console.log('useAuth hook: Force logout on initialization');
        
        if (auth.currentUser) {
          console.log('useAuth hook: Current user exists, signing out:', auth.currentUser.email);
          await signOut(auth);
        }
        
        // Clear any persisted data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('firebase:')) {
            console.log('useAuth hook: Removing localStorage item:', key);
            localStorage.removeItem(key);
          }
        });
        
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('firebase:')) {
            console.log('useAuth hook: Removing sessionStorage item:', key);
            sessionStorage.removeItem(key);
          }
        });
        
        console.log('useAuth hook: Force logout complete');
      } catch (err) {
        console.error('useAuth hook: Error during force logout:', err);
        setError(err);
      }
    };
    
    forceLogout().then(() => {
      // Set up the auth state listener after force logout
      const unsubscribe = onAuthStateChanged(auth, 
        (user) => {
          console.log('useAuth hook: Auth state changed:', user ? `User logged in: ${user.email}` : 'No user');
          setCurrentUser(user);
          setLoading(false);
        },
        (err) => {
          console.error('useAuth hook: Auth state error:', err);
          setError(err);
          setLoading(false);
        }
      );
      
      return () => {
        console.log('useAuth hook: Cleaning up auth listener');
        unsubscribe();
      };
    });
  }, []);
  
  const logout = async () => {
    try {
      console.log('useAuth hook: Logging out');
      await signOut(auth);
      console.log('useAuth hook: Logout successful');
    } catch (err) {
      console.error('useAuth hook: Error logging out:', err);
      setError(err);
      throw err;
    }
  };
  
  return { 
    user: currentUser,
    loading,
    error,
    logout,
    isAuthenticated: !!currentUser
  };
};

export default useAuth; 