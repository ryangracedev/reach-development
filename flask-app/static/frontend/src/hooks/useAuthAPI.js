import { useAuth } from '../context/AuthContext';

export const useAuthAPI = () => {
  const { authState } = useAuth();

  const fetchWithAuth = async (url, options = {}) => {
    console.log('authState in fetchWithAuth:', authState);
    if (!authState.token) {
      throw new Error('No token available. User is not authenticated.');
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${authState.token}`,
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      console.log('Token expired or invalid, signing out.');
      // Optionally, trigger signOut or redirect to login page
    }
    return response;
  };

  return { fetchWithAuth };
};