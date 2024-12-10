import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

const validateToken = (token) => {
  try {
    // Ensure the token has three parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT structure');
    }

    const payload = JSON.parse(atob(parts[1])); // Decode JWT payload
    const isExpired = payload.exp * 1000 < Date.now(); // Check expiration
    return { isValid: !isExpired, payload }; // Return both validation status and payload
  } catch (err) {
    console.error('Invalid token:', err);
    return { isValid: false, payload: null }; // Return false and null payload
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
      userId: null,
      username: null,
      token: null, // Store the session token
    });
  
  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
  
    if (storedToken) {
      const { isValid, payload } = validateToken(storedToken);
  
      if (isValid) {
        setAuthState({
          isAuthenticated: true,
          userId: payload.sub, // `sub` contains the `identity` (user ID)
          username: payload.username, // `username` from additional claims
          token: storedToken,
        });
      } else {
        console.warn("Token expired or invalid. Clearing auth state.");
        localStorage.removeItem('authToken');
        setAuthState({
          isAuthenticated: false,
          userId: null,
          username: null,
          token: null,
        });
      }
    }
  }, []);

  const signIn = (token) => {

    if (!token) {
      console.error('No token provided for signIn');
      return;
    }

    // Parse userId from the JWT payload
    const { isValid, payload } = validateToken(token);


    if (!isValid) {
      console.warn('Removing invalid token from localStorage');
      localStorage.removeItem('authToken');
      setAuthState({
        isAuthenticated: false,
        userId: null,
        username: null,
        token: null,
      });
    }

    console.log("Payload: \n", payload)

    // Save token and username to localStorage
    localStorage.setItem('authToken', token);

    setAuthState({
      isAuthenticated: true,
      userId: payload.sub, // Extracted `user_id` from the JWT's `identity`
      username: payload.username, // Extracted `username` from the additional claims
      token,
    });
  };

  const signOut = () => {
    // Remove token and user info from localStorage
    localStorage.removeItem('authToken');

    setAuthState({
      isAuthenticated: false,
      userId: null,
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