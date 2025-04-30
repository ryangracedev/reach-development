import { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const [needsProfileRefresh, setNeedsProfileRefresh] = useState(false);

  return (
    <ProfileContext.Provider value={{ needsProfileRefresh, setNeedsProfileRefresh }}>
      {children}
    </ProfileContext.Provider>
  );
};