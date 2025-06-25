import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import './style/EventStepOne.css'; // Import the CSS file
import CustomButton from '../common/CustomButton';
import CustomBack from '../common/CustomBack';
import CustomInput from '../common/CustomInput'; // Import CustomInput
import '../../animations/animations.scss'

const EventStepOne = ({ nextStep, transitioning, transitionDirection }) => {
  const navigate = useNavigate();                               // Hook for navigation
  const { eventData, updateEventData } = useEventContext();

  const [showError, setShowError] = useState({
    name: false,
    description: false,
    photo: false,
  });
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    photo: '',
  });

  const animationClass = transitioning
    ? transitionDirection === 'forward'
      ? 'slideLeft'
      : 'slideRight'
    : 'fade-in';

  const handleNext = () => {

    let hasError = false;
    const newErrors = { name: '', description: '', photo: '' };
    const newShowError = { name: false, description: false, photo: false };

    if (!eventData.name.trim()) {
      newErrors.name = '* Name Required';
      newShowError.name = true;
      hasError = true;
    }

    if (!eventData.description.trim()) {
      newErrors.description = '* About Required';
      newShowError.description = true;
      hasError = true;
    }

    if (!eventData.imagePreview) {
      newErrors.photo = '* Photo Required';
      newShowError.photo = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setShowError(newShowError);

      // Auto-clear logic
      setTimeout(() => {
        setShowError({ name: false, description: false, photo: false });
        setTimeout(() => setErrors({ name: '', description: '', photo: '' }), 300);
      }, 2000);

      return;
    }
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
    <div className={`event-step-one ${animationClass}`}>
      <div className='event-inputs-one'>
        <div className='event-input-name'>
          <CustomInput
            label="Title"
            placeholder="Title"
            value={eventData.name}
            onChange={(e) => updateEventData('name', e.target.value)}
            inputType="name"
            multiline={true}
            count={true}
            errorMessage={errors.name}
            errorVisible={showError.name}
            inputDescription={'In a few words.'}
            maxChar={40}
          />
        </div>
        <div className='custom-textarea'>
          <CustomInput
            label="Description"
            placeholder="Description"
            value={eventData.description}
            onChange={(e) => updateEventData('description', e.target.value)}
            inputType="description"
            multiline={true}
            count={true}
            errorMessage={errors.description}
            errorVisible={showError.description}
            inputDescription={'What are the details?'}
            maxChar={100}
            isDescription={true}
          />
        </div>
        <div className='event-upload-row'>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="event-input-photo"
            accept="image/*"
          />
          <label
            htmlFor="file-upload"
            className={`custom-file-upload photo-upload-label ${eventData.imagePreview ? 'visible' : ''}`}
          >
            Photo
          </label>
          {eventData.imagePreview && (
            <label htmlFor="file-upload">
              <img src={eventData.imagePreview} alt="Preview" className="image-preview clickable" />
            </label>
          )}
          <p className={`event-step-one__input-description ${(showError.photo || (!eventData.imagePreview && !errors.photo)) ? 'visible' : ''} ${errors.photo ? 'error' : ''}`}>
            {errors.photo ? errors.photo : 'Add a visual.'}
          </p>
        </div>
      </div>
      <div className='nav'>
        <CustomBack className="back-btn" onClick={handlePrev} />
        <CustomButton className="next-btn" text="Next" onClick={handleNext} color="black" />
      </div>
    </div>
  );
};

export default EventStepOne;
