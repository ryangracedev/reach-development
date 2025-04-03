import React from 'react';
import UsernameStep from '../../components/accountCreation/UsernameStep';
import PasswordStep from '../../components/accountCreation/PasswordStep';
import PhoneStep from '../../components/accountCreation/PhoneStep';
import VerificationStep from '../../components/accountCreation/VerificationStep';
// import useBackgroundColor from '../../hooks/useBackgroundColor';

const SignupSteps = ({ currentStep, nextStep, prevStep, updateFormData, formData }) => {

  // useBackgroundColor(currentStep >= 1 && currentStep <= 4); 

  switch (currentStep) {
    case 1:
      return <UsernameStep nextStep={nextStep} prevStep={prevStep} updateFormData={updateFormData} formData={formData} />;
    case 2:
      return <PasswordStep nextStep={nextStep} prevStep={prevStep} updateFormData={updateFormData} formData={formData} />;
    case 3:
      return <PhoneStep nextStep={nextStep} prevStep={prevStep} updateFormData={updateFormData} formData={formData} />;
    case 4:
      return (
        <VerificationStep nextStep={nextStep} prevStep={prevStep} updateFormData={updateFormData} formData={formData} />
      );
    default:
      return null;
  }
};


export default SignupSteps;