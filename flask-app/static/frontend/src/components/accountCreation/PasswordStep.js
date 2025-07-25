import React, { useState, useEffect } from 'react';
import './style/SignupPage.css'; // Import the CSS file
import './style/PasswordStep.css';
import CustomBack from '../common/CustomBack';
import CustomHollow from '../common/CustomButtonHollow';
import CustomButton from '../common/CustomButton';
import CustomInput from '../common/CustomInput'; // Import CustomInput
import '../../animations/animations.scss';

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

const PasswordStep = ({ nextStep, prevStep, updateFormData, formData, transitioning, transitionDirection, fadeIn }) => {
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ password: '' });
  const [showError, setShowError] = useState({ password: false });

  let animationClass = '';

  if (transitioning) {
    animationClass = transitionDirection === 'forward' ? 'slideLeft' : 'slideRight';
  } else if (fadeIn) {
    animationClass = 'fade-in';
  }

  useEffect(() => {
    setPassword(formData.password || ''); // Keep input in sync when formData updates
  }, [formData.password]);

  const handleNext = () => {
    // Validate the password
    const { isValid, error: validationError } = validatePassword(password);

    if (!isValid) {
      setErrors({ password: validationError });
      setShowError({ password: true });

      setTimeout(() => {
        setShowError({ password: false });
        setTimeout(() => setErrors({ password: '' }), 300);
      }, 5000);
      return; // Stop further execution if validation fails
    }

    // Clear any previous error
    setErrors({ password: '' });
    setShowError({ password: false });

    // Update the form data and move to the next step
    updateFormData('password', password);
    nextStep();
  };

  console.log("prevStep function in PasswordStep:", prevStep);
  
  return (
    <div className={`signup-step-two ${animationClass}`}>
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
            errorMessage={errors.password}
            errorVisible={showError.password}
            inputDescription={'Must be 8 characters minimum, with a number.'}
            maxChar={64}
            isNormalInput={true}
          />
          {/* <p className="password-info">
            Must be 8 characters minimum, with a number.
          </p> */}
        </div>
      </div>
      <div className='nav'>
        <CustomBack className="back-btn" onClick={prevStep} color='white' />
        <CustomButton className="next-btn" text="Next" onClick={handleNext} color="black" />
      </div>
    </div>
  );
};

export default PasswordStep;
