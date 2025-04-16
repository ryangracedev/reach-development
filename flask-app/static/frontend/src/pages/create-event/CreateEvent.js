import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventStepOne from '../../components/eventCreation/EventStepOne';
import EventStepTwo from '../../components/eventCreation/EventStepTwo';
import EventPreview from '../../components/eventCreation/EventPreview';
import EventCreated from '../../components/eventCreation/EventCreated';
import SignupSteps from '../signup/SignupSteps'; // Import SignupSteps
import AuthRequired from './AuthRequired';
import { EventProvider } from '../../context/EventContext';
import './style/EventCreation.scss';

const CreateEvent = () => {
  const { authState } = useAuth();                      // Holds authentication status (isAuthenticated).
  const [step, setStep] = useState(1);                  // Tracks the current step in the event creation process.
  const [formData, setFormData] = useState({});         // Store user input across steps
  const [transitioning, setTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
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
    setTransitionDirection('backward');
    setTransitioning(true);
    setFadeIn(false); // reset fade in
    setTimeout(() => {
      setStep((prev) => prev - 1);
      setTransitioning(false);
      setFadeIn(true); // trigger fade-in for new content
    }, 300);
  };

  // Updates formData dynamically
  const updateFormData = (key, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };
      console.log("Updated formData:", newData); // Debugging
      return newData;
    });
  };

  // Ensure background is white only during the signup steps OR when an unauthenticated user is in signup
  // const isSignupActive = (!authState.isAuthenticated && step >= 4 && step <= 7);
  // const isEventCreationComplete = (authState.isAuthenticated && step >= 4); // Fixes issue

  // useBackgroundColor(isSignupActive ? true : isEventCreationComplete ? false : null);

  // DEBUG
  console.log('AuthState in CreateEvent:', authState);

  // Handle AUthentication Delay
  if (authState.isAuthenticated === null) {
    return <p>Loading authentication status...</p>;
  }

  // DEBUG
  console.log("authState is not NULL");
  console.log("Step: ", step);
  console.log("Auth State: ", authState.isAuthenticated)
  console.log("Event Data: ", formData)

  return (
    <EventProvider>
      <div className="background-video-container">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="create-party-background-video"
        >
          <source src="/background-gradient.mov" type="video/quicktime" />  
          <source src="/background-gradient.mp4" type="video/mp4" /> 
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="create-event-container">
          {/* Step 1: Name, Photo, Description */}
          {step === 1 && ( 
            <EventStepOne 
              nextStep={nextStep}
              transitioning={transitioning}
              transitionDirection={transitionDirection}
            />
          )}
          {/* Step 2: Address, Date, Time */}
          {step === 2 && (
            <EventStepTwo 
              nextStep={nextStep} 
              prevStep={prevStep} 
              transitioning={transitioning}
              transitionDirection={transitionDirection}
            />
          )}
          {/* Step 3: If user is NOT signed in, show AuthRequired */}
          {!authState.isAuthenticated && step === 3 && (
            <AuthRequired 
              nextStep={nextStep}
              transitioning={transitioning}
              transitionDirection={transitionDirection}
            />
          )}
          {/* Step 4-7: Signup Process (Username, Password, Phone, Verification) */}
          {!authState.isAuthenticated && step >= 4 && step <= 7 && (
            <SignupSteps
              currentStep={step - 3}          // Offset to map step 3-6 to SignupSteps (1-4)
              nextStep={nextStep}
              prevStep={prevStep}
              updateFormData={updateFormData}
              formData={formData}             // Pass formData
              transitioning={transitioning}
              transitionDirection={transitionDirection}
              fadeIn={fadeIn}
            />
          )}
          {/* Step 3 (if signed in) or Step 8 (after signup): Event Preview */}
          {(authState.isAuthenticated && step === 3) || (authState.isAuthenticated && step === 8) ? (
            <EventPreview 
              nextStep={nextStep} 
              transitioning={transitioning}
              transitionDirection={transitionDirection}
              fadeIn={fadeIn}
            />
          ) : null}
          {/* Step 4 (if signed in) or Step 9 (after signup): Event Created */}
          {(authState.isAuthenticated && step === 4) || (authState.isAuthenticated && step === 9) ? (
            <EventCreated />
          ) : null}
        </div>
    </EventProvider>
  );
};

export default CreateEvent;