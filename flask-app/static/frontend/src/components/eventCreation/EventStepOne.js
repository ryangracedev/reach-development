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
      setError('Name and description required');
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
    if (file) {
      updateEventData('image', file); // Save the image file
      const reader = new FileReader();
      reader.onloadend = () => {
        updateEventData('imagePreview', reader.result); // Save preview URL
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="event-step-one">
      <div className='event-inputs-one'>
        <input
          type="text"
          placeholder="Name"
          value={eventData.name}
          className={`event-input-name ${eventData.name ? 'filled' : ''}`}
          onChange={(e) => updateEventData('name', e.target.value)}
        />
        <div className='event-upload-row'>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="event-input-photo"
            accept="image/*"
          />
          <label htmlFor="file-upload" className="custom-file-upload">Photo</label>
          {eventData.imagePreview && (
            <label htmlFor="file-upload">
              <img src={eventData.imagePreview} alt="Preview" className="image-preview clickable" />
            </label>
          )}
        </div>
        <textarea
          id="event-description"
          placeholder="About"
          className="custom-textarea"
          value={eventData.description}
          onChange={(e) => updateEventData('description', e.target.value)}
        />
      </div>
      <p className={`error ${error ? 'visible' : ''}`}>{error}</p>
      <div className='nav'>
        <CustomBack className="back-btn" onClick={handlePrev} />
        <CustomButton className="next-btn" text="Next" onClick={handleNext} color="black" />
      </div>
    </div>
  );
};

export default EventStepOne;
