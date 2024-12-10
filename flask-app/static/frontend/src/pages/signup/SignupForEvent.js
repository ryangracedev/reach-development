import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SignupSteps from './SignupSteps'; // Import the reusable SignupSteps component

const SignupForEvent = () => {
  const [step, setStep] = useState(1); // Track signup steps
  const [formData, setFormData] = useState({}); // Store user data
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve the return path and action (Yes/No) from state
  const { returnTo, action } = location.state || {};

  const nextStep = () => setStep((prev) => prev + 1);

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

  return (
    <div>
      <SignupSteps
        currentStep={step}
        nextStep={() => {
          nextStep();
          if (step === 4) {
            handleSignupComplete(); // After verification, redirect to the event page
          }
        }}
        updateFormData={updateFormData}
        formData={formData}
      />
    </div>
  );
};

export default SignupForEvent;