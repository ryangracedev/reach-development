import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import './style/EventStepTwo.css'; // Import the CSS file
import CustomButton from '../common/CustomButton';
import CustomBack from '../common/CustomBack';
import CustomInput from '../common/CustomInput'; // Import CustomInput
import '../../animations/animations.scss'

const EventStepTwo = ({ nextStep, prevStep, transitioning, transitionDirection }) => {
  const { eventData, updateEventData } = useEventContext();
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const [showError, setShowError] = useState({
    address: false,
    date: false,
    time: false,
  });
  const [errors, setErrors] = useState({
    address: '',
    date: '',
    time: '',
  });

  const animationClass = transitioning
  ? transitionDirection === 'forward'
    ? 'slideLeft'
    : 'slideRight'
  : 'fade-in';

  const handleNext = () => {
    console.log("Selected Date:", eventData.date);
    console.log("Selected Time:", eventData.time);

    let hasError = false;
    const newErrors = { address: '', date: '', time: '' };
    const newShowError = { address: false, date: false, time: false };

    if (!eventData.address.trim()) {
      newErrors.address = '* Address is required';
      newShowError.address = true;
      hasError = true;
    }

    if (!eventData.date) {
      newErrors.date = '* Date is required';
      newShowError.date = true;
      hasError = true;
    }

    if (!eventData.time) {
      newErrors.time = '* Time is required';
      newShowError.time = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setShowError(newShowError);

      // Auto-clear logic
      setTimeout(() => {
        setShowError({ address: false, date: false, time: false });
        setTimeout(() => setErrors({ address: '', date: '', time: '' }), 300);
      }, 2000);

      return;
    }
  
    // Combine date and time into a single ISO string
    const combinedDateTime = new Date(`${eventData.date}T${eventData.time}`).toISOString();
  
    console.log("Combined DateTime:", combinedDateTime);
  
    // Update eventData with the combined dateTime
    updateEventData('dateTime', combinedDateTime);
  
    nextStep();
  };

  const handlePrev = () => {
    prevStep();
  }

  return (
    <div className={`event-step-two ${animationClass}`}>
      <div className='event-inputs-two'>
        <div className='address-box'>
          <CustomInput
            label="Address"
            placeholder="Address"
            value={eventData.address || ""}
            onChange={(e) => updateEventData('address', e.target.value)}
            inputType="name"
            wrap={false}
            count={false}
            inputDescription={'The address will be released 2 hours before the party starts.'}
            errorMessage={errors.address}
            errorVisible={showError.address}
            isAddressInput={true}
          />
{/* 
          <p className="address-info">
            Address is released 2 hours before the party starts. So, if it starts at 9pm, the address is released at 7pm.
          </p> */}
        </div>

        <div className="event-date-time-container">

          <div className="input-container">

            <div className="floating-label-wrapper">
              <label htmlFor="event-date" className="input-label">Date</label>
              <input
                type="date"
                id="event-date"
                className="event-input"
                value={eventData.date || ""}
                onChange={(e) => updateEventData('date', e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <span className={`floating-placeholder ${(eventData.date || isFocused) ? 'active' : ''}`}>
                Select a date
              </span>
            </div>
            <div id='when-error' className={`error-message-container ${showError.date ? 'visible' : ''}`}>
              {errors.date && <p className='error-message'>{errors.date}</p>}
            </div>

          </div>

          <div className="input-container">

            <div className="floating-label-wrapper">
              <label htmlFor="event-time" className="input-label">Time</label>
              <input
                type="time"
                id="event-time"
                className="event-input"
                placeholder='--'
                value={eventData.time || ""}
                onChange={(e) => updateEventData('time', e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <span className={`floating-placeholder ${(eventData.time || isFocused) ? 'active' : ''}`}>
                Select a time
              </span>
            </div>
            <div id='time-error' className={`error-message-container ${showError.time ? 'visible' : ''}`}>
              {errors.time && <p className='error-message'>{errors.time}</p>}
            </div>

          </div>


        </div>

      </div>

      <div className='nav'>
        <CustomBack className="back-btn" onClick={handlePrev} />
        <CustomButton className="next-btn" text="Next" onClick={handleNext} color="black" />
      </div>
    </div>
  );
};

export default EventStepTwo;
