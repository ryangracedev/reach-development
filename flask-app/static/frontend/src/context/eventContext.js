import React, { createContext, useContext, useState } from 'react';

// Create the EventContext
const EventContext = createContext();

// Custom hook to use the EventContext
export const useEventContext = () => {
  return useContext(EventContext);
};

// Provider component
export const EventProvider = ({ children }) => {
  const [eventData, setEventData] = useState({
    image: null,
    name: '',
    description: '',
    address: '',
    dateTime: '',
  });

  const updateEventData = (key, value) => {
    console.log(`Updating Event Data: ${key} = ${value}`); // Debugging line
    setEventData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <EventContext.Provider value={{ eventData, updateEventData }}>
      {children}
    </EventContext.Provider>
  );
};
