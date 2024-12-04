import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Custom Hook to Use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
    console.log('AuthContext:', context); // Debugging
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
  
      if (storedToken && storedUsername) {
        setAuthState({
          isAuthenticated: true,
          username: storedUsername,
          token: storedToken,
        });
      }
    }, []);
  
    const signIn = (username, token) => {
      // Save token and username to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUsername', username);
  
      setAuthState({
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