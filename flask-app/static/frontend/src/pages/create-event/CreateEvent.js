import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventStepOne from '../../components/eventCreation/EventStepOne';
import EventStepTwo from '../../components/eventCreation/EventStepTwo';
import EventPreview from '../../components/eventCreation/EventPreview';
import EventCreated from '../../components/eventCreation/EventCreated';
import SignupSteps from '../signup/SignupSteps'; // Import SignupSteps
import { EventProvider } from '../../context/EventContext';

const CreateEvent = () => {
  const { authState } = useAuth(); // Get authentication state
  //console.log('AuthState in CreateEvent:', authState); // Debugging
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({}); // Store user input data

  console.log('AuthState in CreateEvent:', authState);

  const nextStep = () => setStep((prev) => prev + 1);

  const updateFormData = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (authState.isAuthenticated === null) {
    return <p>Loading authentication status...</p>;
  }

  console.log("authState is not NULL");

  console.log("Step: ", step);

  console.log("Auth State: ", authState.isAuthenticated)

  return (
    <EventProvider>
      <div className="create-event-container">
        {step === 1 && <EventStepOne nextStep={nextStep} />}
        {step === 2 && <EventStepTwo nextStep={nextStep} />}

        {/* Branch logic: If the user is not signed in, use SignupSteps */}
        {!authState.isAuthenticated && step >= 3 && step <= 6 && (
          <SignupSteps
            currentStep={step - 2} // Offset to map step 3-6 to SignupSteps (1-4)
            nextStep={nextStep}
            updateFormData={updateFormData}
            formData={formData} // Pass formData
          />
        )}

        {/* Preview and Create logic */}
        {(authState.isAuthenticated && step === 3) || (authState.isAuthenticated && step === 7) ? (
          <EventPreview nextStep={nextStep} />
        ) : null}
        {(authState.isAuthenticated && step === 4) || (authState.isAuthenticated && step === 8) ? (
          <EventCreated />
        ) : null}
      </div>
    </EventProvider>
  );
};

export default CreateEvent;