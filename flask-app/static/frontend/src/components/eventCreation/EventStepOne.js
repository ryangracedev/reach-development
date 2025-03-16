import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import './style/EventStepOne.css'; // Import the CSS file
import CustomButton from '../common/CustomButton';
import CustomBack from '../common/CustomBack';

const EventStepOne = ({ nextStep }) => {
  const navigate = useNavigate();                               // Hook for navigation
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

  const handlePrev = () => {
    navigate('/');
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    updateEventData('image', file); // Save the image file
  };

  return (
    <div className="event-step-one">
      <div className='event-inputs-one'>
        <input
          type="text"
          placeholder="Name"
          value={eventData.name}
          className='event-input-name'
          onChange={(e) => updateEventData('name', e.target.value)}
        />
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          className="event-input-photo"
          accept="image/*"
        />
        <label htmlFor="file-upload" className="custom-file-upload">Photo</label>
        <textarea
          id="event-description"
          placeholder="About"
          className="custom-textarea"
          value={eventData.description}
          onChange={(e) => updateEventData('description', e.target.value)}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <div className='nav'>
        <CustomBack className="back-btn" onClick={handlePrev} />
        <CustomButton className="next-btn" text="Next" onClick={handleNext} color="black" />
      </div>
    </div>
  );
};

export default EventStepOne;
