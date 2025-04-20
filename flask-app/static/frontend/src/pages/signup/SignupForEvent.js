import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SignupSteps from './SignupSteps'; // Import the reusable SignupSteps component
import './style/SignupForEvent.css';
import EventStack from '../../components/common/EventStack';

const SignupForEvent = () => {
  const [step, setStep] = useState(1); // Track signup steps
  const [formData, setFormData] = useState({}); // Store user data
  const [transitioning, setTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setLoaded(true);
    setFadeIn(true);
  }, []);

  const nextStep = () => {
    setTransitionDirection('forward');
    setTransitioning(true);
    setFadeIn(false); // reset fade in
    setTimeout(() => {
      setStep((prev) => prev + 1);
      setTransitioning(false);
      setFadeIn(true); // trigger fade-in for new content
    }, 300);
  };
  const prevStep = () => {
    if (step === 1) {
      // Go back to the event page with preserved state
      navigate(returnTo, { state: { action } });
      return;
    }
    setTransitionDirection('backward');
    setTransitioning(true);
    setFadeIn(false); // reset fade in
    setTimeout(() => {
      setStep((prev) => prev - 1);
      setTransitioning(false);
      setFadeIn(true); // trigger fade-in for new content
    }, 300);
  };

  // Retrieve the return path and action (Yes/No) from state
  const { returnTo, action, eventData } = location.state || {};

  const updateFormData = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSignupComplete = () => {
    if (returnTo) {
      // Redirect to the event page with the action (Yes/No) preserved
      navigate(returnTo, { state: { action } });
    }
  };

  const imageUrl = eventData.image instanceof File
    ? URL.createObjectURL(eventData.image) // Convert File object to a URL
    : eventData.image || '/default-image.jpg'; // Use stored URL or fallback

  return (
    <div className='signup-for-event'>
    {/* {eventData && eventData.image && (
      <div className='event-image'>
        <EventStack
          image={imageUrl}
          name={eventData.name}
          description={eventData.description}
          dateTime={eventData.dateTime}
        />
      </div>
    )} */}
      <div className="signup-slides">
        <SignupSteps
          currentStep={step}
          nextStep={nextStep}
          prevStep={prevStep}
          updateFormData={updateFormData}
          formData={formData}
          handleSignupComplete={handleSignupComplete}
          transitioning={transitioning}
          transitionDirection={transitionDirection}
          fadeIn={fadeIn}
        />
      </div>
    </div>
  );
};

export default SignupForEvent;