import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventStepOne from '../../components/eventCreation/EventStepOne';
import EventStepTwo from '../../components/eventCreation/EventStepTwo';
import EventPreview from '../../components/eventCreation/EventPreview';
import EventCreated from '../../components/eventCreation/EventCreated';
import SignupSteps from '../signup/SignupSteps'; // Import SignupSteps
import AuthRequired from './AuthRequired';
import useBackgroundColor from '../../hooks/useBackgroundColor';
import { EventProvider } from '../../context/EventContext';
import './style/EventCreation.css';

const CreateEvent = () => {
  const { authState } = useAuth();                      // Holds authentication status (isAuthenticated).
  const [step, setStep] = useState(1);                  // Tracks the current step in the event creation process.
  const [formData, setFormData] = useState({});         // Store user input across steps

  const nextStep = () => setStep((prev) => prev + 1);   // Increments the steps when "Next" is clicked
  const prevStep = () => setStep((prev) => prev - 1);   // Add prevStep

  // Updates formData dynamically
  const updateFormData = (key, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };
      console.log("Updated formData:", newData); // Debugging
      return newData;
    });
  };

  // Ensure background is white only during the signup steps OR when an unauthenticated user is in signup
  const isSignupActive = (!authState.isAuthenticated && step >= 4 && step <= 7);
  const isEventCreationComplete = (authState.isAuthenticated && step >= 4); // Fixes issue

  useBackgroundColor(isSignupActive ? true : isEventCreationComplete ? false : null);

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
      <div className="create-event-container">

        {/* Step 1: Name, Photo, Description */}
        {step === 1 && <EventStepOne nextStep={nextStep} />}
        {/* Step 2: Address, Date, Time */}
        {step === 2 && <EventStepTwo nextStep={nextStep} prevStep={prevStep} />}
        {/* Step 3: If user is NOT signed in, show AuthRequired */}
        {!authState.isAuthenticated && step === 3 && <AuthRequired nextStep={nextStep} />}
        {/* Step 4-7: Signup Process (Username, Password, Phone, Verification) */}
        {!authState.isAuthenticated && step >= 4 && step <= 7 && (
          <SignupSteps
            currentStep={step - 3}          // Offset to map step 3-6 to SignupSteps (1-4)
            nextStep={nextStep}
            prevStep={prevStep}
            updateFormData={updateFormData}
            formData={formData}             // Pass formData
          />
        )}
        {/* Step 3 (if signed in) or Step 8 (after signup): Event Preview */}
        {(authState.isAuthenticated && step === 3) || (authState.isAuthenticated && step === 8) ? (
          <EventPreview nextStep={nextStep} />
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