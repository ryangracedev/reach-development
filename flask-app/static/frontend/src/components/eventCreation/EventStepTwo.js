import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import './style/EventStepTwo.css'; // Import the CSS file
import CustomButton from '../common/CustomButton';
import CustomBack from '../common/CustomBack';

const EventStepTwo = ({ nextStep, prevStep }) => {
  const { eventData, updateEventData } = useEventContext();
  const [error, setError] = useState('');

  const handleNext = () => {
    console.log("Selected Date:", eventData.date);
    console.log("Selected Time:", eventData.time);
    if (!eventData.address || !eventData.date || !eventData.time) {
      setError('Event address, date, and time are required');
      return;
    }
  
    // Combine date and time into a single ISO string
    const combinedDateTime = new Date(`${eventData.date}T${eventData.time}`).toISOString();
  
    console.log("Combined DateTime:", combinedDateTime);
  
    // Update eventData with the combined dateTime
    updateEventData('dateTime', combinedDateTime);
  
    setError('');
    nextStep();
  };

  const handlePrev = () => {
    prevStep();
  }

  return (
    <div className="event-step-two">
      <div className='event-inputs-two'>
        <div className='address-box'>
          <input
            type="text"
            placeholder="Where"
            value={eventData.address || ""}  // Ensure it's always a string
            className='event-input-address'
            onChange={(e) => updateEventData('address', e.target.value)}
          />
          <p className="address-info">
            The address is always released 2 hours before it starts. So if your party starts at 9,<br/>the address is released at 7.
          </p>
        </div>

        <div className="input-container">
          <label htmlFor="event-date" className="input-label">When</label>
          <input
            type="date"
            id="event-date"
            className="event-input"
            value={eventData.date || ""}  // Default to an empty string if undefined
            onChange={(e) => updateEventData('date', e.target.value)}
          />
        </div>

        <div className="input-container">
          <label htmlFor="event-time" className="input-label">Time</label>
          <input
            type="time"
            id="event-time"
            className="event-input"
            value={eventData.time || ""}  // Default to an empty string if undefined
            onChange={(e) => updateEventData('time', e.target.value)}
          />
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      <div className='nav'>
        <CustomBack className="back-btn" onClick={handlePrev} />
        <CustomButton className="next-btn" text="Next" onClick={handleNext} color="black" />
      </div>
    </div>
  );
};

export default EventStepTwo;
