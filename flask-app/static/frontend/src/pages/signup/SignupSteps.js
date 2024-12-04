import React from 'react';
import UsernameStep from '../../components/accountCreation/UsernameStep';
import PasswordStep from '../../components/accountCreation/PasswordStep';
import PhoneStep from '../../components/accountCreation/PhoneStep';
import VerificationStep from '../../components/accountCreation/VerificationStep';

const SignupSteps = ({ currentStep, nextStep, updateFormData, formData }) => {
  switch (currentStep) {
    case 1:
      return <UsernameStep nextStep={nextStep} updateFormData={updateFormData} formData={formData} />;
    case 2:
      return <PasswordStep nextStep={nextStep} updateFormData={updateFormData} formData={formData} />;
    case 3:
      return <PhoneStep nextStep={nextStep} updateFormData={updateFormData} formData={formData} />;
    case 4:
      return (
        <VerificationStep nextStep={nextStep} updateFormData={updateFormData} formData={formData} />
      );
    default:
      return null;
  }
};


export default SignupSteps;