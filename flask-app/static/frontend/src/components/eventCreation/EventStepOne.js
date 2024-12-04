import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';

const EventStepOne = ({ nextStep }) => {
  const { eventData, updateEventData } = useEventContext();
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!eventData.name.trim() || !eventData.description.trim()) {
      setError('Event name and description are required');
      return;
    }
    setError('');
    nextStep();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    updateEventData('image', file); // Save the image file
  };

  return (
    <div className="event-step">
      <h2>Add Event Details</h2>
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
      />
      <input
        type="text"
        placeholder="Event Name"
        value={eventData.name}
        onChange={(e) => updateEventData('name', e.target.value)}
      />
      <textarea
        placeholder="Event Description"
        value={eventData.description}
        onChange={(e) => updateEventData('description', e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default EventStepOne;
