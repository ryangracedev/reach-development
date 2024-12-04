import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';

const EventStepTwo = ({ nextStep }) => {
  const { eventData, updateEventData } = useEventContext();
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!eventData.address.trim() || !eventData.dateTime) {
      setError('Event address and date/time are required');
      return;
    }
    setError('');
    nextStep();
  };

  return (
    <div className="event-step">
      <h2>Add Event Address and Date</h2>
      <input
        type="text"
        placeholder="Event Address"
        value={eventData.address}
        onChange={(e) => updateEventData('address', e.target.value)}
      />
      <input
        type="datetime-local"
        value={eventData.dateTime}
        onChange={(e) => updateEventData('dateTime', e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default EventStepTwo;
