import React, { useState } from 'react';
import UsernameStep from './UsernameStep';
import PasswordStep from './PasswordStep';
import PhoneStep from './PhoneStep';
import VerificationStep from './VerificationStep';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phoneNumber: '',
    verificationCode: '',
  });

  // Handle form data updates
  const updateFormData = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Handle navigation between steps
  const nextStep = () => setStep((prevStep) => prevStep + 1);
  const prevStep = () => setStep((prevStep) => prevStep - 1);

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return <UsernameStep nextStep={nextStep} updateFormData={updateFormData} />;
      case 2:
        return <PasswordStep nextStep={nextStep} updateFormData={updateFormData} />;
      case 3:
        return (
            <PhoneStep 
                formData={formData}
                nextStep={nextStep} 
                updateFormData={updateFormData}
            />
        );
      case 4:
        return (
          <VerificationStep
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return <div className="signup-container">{renderStep()}</div>;
};

export default Signup;
