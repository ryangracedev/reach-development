import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

const validateToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    const isExpired = payload.exp * 1000 < Date.now(); // Check expiration
    return !isExpired;
  } catch (err) {
    console.error('Invalid token:', err);
    return false;
  }
};

// Custom Hook to Use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
    //console.log('AuthContext:', context); // Debugging
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
      isAuthenticated: false,
      username: null,
      token: null, // Store the session token
    });
  
    // Check for existing token on app load
    useEffect(() => {
      const storedToken = localStorage.getItem('authToken');
      const storedUsername = localStorage.getItem('authUsername');
    
      if (storedToken && storedUsername && validateToken(storedToken)) {
        setAuthState({
          isAuthenticated: true,
          username: storedUsername,
          token: storedToken,
        });
      } else {
        console.warn("Invalid token or no token found. Clearing auth state.");
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUsername');
        setAuthState({
          isAuthenticated: false,
          username: null,
          token: null,
        });
      }
    }, []);
  
    const signIn = (username, token) => {
      // For Testing
      console.log("Signing in user:", username);
      console.log("Token received:", token);
      // Save token and username to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUsername', username);
  
        // Delay the state update
      setTimeout(() => {
        setAuthState({
          isAuthenticated: true,
          username,
          token,
        });
        console.log("Auth state after signIn:", authState); // Debugging
      }, 0); // Small delay
      // For Testing
      // Log after setting the state
      console.log('Auth state inside signIn (immediately after setAuthState):', {
        isAuthenticated: true,
        username,
        token,
      });
    };
  
    const signOut = () => {
      // Remove token and username from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUsername');
  
      setAuthState({
        isAuthenticated: false,
        username: null,
        token: null,
      });
    };
  
    return (
      <AuthContext.Provider value={{ authState, signIn, signOut }}>
        {children}
      </AuthContext.Provider>
    );
  };