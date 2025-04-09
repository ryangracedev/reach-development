import React, { useState, useEffect } from 'react';
import './style/SignupPage.css'; // Import the CSS file
import './style/PasswordStep.css';
import CustomBack from '../common/CustomBack';
import CustomHollow from '../common/CustomButtonHollow';
import CustomButton from '../common/CustomButton';
import CustomInput from '../common/CustomInput'; // Import CustomInput

// Password validation function
const validatePassword = (password) => {
  const minLength = 8;
  const hasNumberOrSpecialChar = /[0-9!@#$%^&*]/;

  if (!password || password.length < minLength) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }

  if (!hasNumberOrSpecialChar.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number or special character (!@#$%^&*).' };
  }

  return { isValid: true, error: null };
};

const PasswordStep = ({ nextStep, prevStep, updateFormData, formData }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setPassword(formData.password || ''); // Keep input in sync when formData updates
  }, [formData.password]);

  const handleNext = () => {
    // Validate the password
    const { isValid, error: validationError } = validatePassword(password);

    if (!isValid) {
      setError(validationError);
      return; // Stop further execution if validation fails
    }

    // Clear any previous error
    setError('');

    // Update the form data and move to the next step
    updateFormData('password', password);
    nextStep();
  };

  console.log("prevStep function in PasswordStep:", prevStep);
  
  return (
    <div className="signup-step-two">
      {/* <div className='logo-container'>
        <img src="/Logo-Inflated2.png" alt="Reach Logo" className="signup-logo" />
      </div> */}
      <div className='content-area'>
        <div className='password-box'>
          <CustomInput
            label="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputType="name"
            wrap={false}
            count={false}
          />
          <p className="password-info">
            Must be 8 characters minimum, with a number.
          </p>
        </div>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className='nav'>
        <CustomBack className="back-btn" onClick={prevStep} color='white' />
        <CustomButton className="next-btn" text="Next" onClick={handleNext} color="black" />
      </div>
    </div>
  );
};

export default PasswordStep;
