import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupSteps from './SignupSteps'; // Re-use the same component

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const nextStep = () => setStep((prev) => prev + 1);

  // Instead of passing key and value separately, it might be simpler to use an object approach:
  const updateFormData = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSignupComplete = () => {
    // After the user finishes all signup steps, decide where to navigate
    // For instance, you can send them to the sign-in page or directly to a profile page.
    // navigate('/signin');
    // or if you have a profile route and can access username from formData:
    // navigate(`/profile/${formData.username}`);
    
    navigate('/');
  };

  return (
    <div>
      <SignupSteps
        currentStep={step}
        nextStep={() => {
          nextStep();
          // If step 4 is your final verification step:
          if (step === 4) {
            handleSignupComplete();
          }
        }}
        updateFormData={updateFormData}
        formData={formData}
      />
    </div>
  );
};

export default Signup;