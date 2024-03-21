import React, { createContext, useContext, useState } from 'react';

const EventContext = createContext();

export function useEvent() {
  return useContext(EventContext);
}

export const EventProvider = ({ children }) => {
  const [eventData, setEventData] = useState({
    eventName: '',
    eventDescription: '',
    eventAddress: '',
    eventDate: '',
    eventTime: '',
    hostName: ''
    // Add other event properties here as needed
  });

  const updateEventData = (newData) => {
    setEventData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  return (
    <EventContext.Provider value={{ eventData, updateEventData }}>
      {children}
    </EventContext.Provider>
  );
};