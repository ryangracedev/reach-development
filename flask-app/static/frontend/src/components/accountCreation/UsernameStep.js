import React, { useState, useEffect } from 'react';
import './style/SignupPage.css'; // Import the CSS file
import './style/UsernameStep.css'; // Import the CSS file
import CustomBack from '../common/CustomBack';
import CustomHollow from '../common/CustomButtonHollow';
import CustomButton from '../common/CustomButton';
import CustomInput from '../common/CustomInput'; // Import CustomInput
import '../../animations/animations.scss';

const UsernameStep = ({ nextStep, prevStep, updateFormData, formData, transitioning, transitionDirection, fadeIn }) => {
  const [username, setUsername] = useState(formData.username || ''); // Initialize with saved value
  const [error, setError] = useState('');

  let animationClass = '';

  if (transitioning) {
    animationClass = transitionDirection === 'forward' ? 'slideLeft' : 'slideRight';
  } else if (fadeIn) {
    animationClass = 'fade-in';
  }

  const [showError, setShowError] = useState({
    username: false,
  });

  const [errors, setErrors] = useState({
    username: '',
  });

  useEffect(() => {
    setUsername(formData.username || ''); // Keep input in sync when formData updates
  }, [formData.username]);

  const handleNext = async () => {
    let hasError = false;
    const newErrors = { username: '' };
    const newShowError = { usernmae: false };

    // Frontend validation: Ensure the username is not empty
    if (!username.trim()) {
      newErrors.username = 'Username is required';
      newShowError.username = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setShowError(newShowError);

      setTimeout(() => {
        setShowError({ username: false });
        setTimeout(() => setErrors({ username: '' }), 300);
      }, 5000);
      return;
    }

    try {
      // Make API call to check if the username exists
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if username already exists
        if (data.exists) {
          setErrors({ username: 'Username already exists' });
          setShowError({ username: true });
  
          setTimeout(() => {
            setShowError({ username: false });
            setTimeout(() => setErrors({ username: '' }), 300);
          }, 5000);
  
          return;
        }

        // Username is valid, proceed to the next step
        updateFormData('username', username);
        nextStep();
        
      } else {
        const errorData = await response.json();
        setErrors({ username: errorData.error || 'Something went wrong.' });
        setShowError({ username: true });
  
        setTimeout(() => {
          setShowError({ username: false });
          setTimeout(() => setErrors({ username: '' }), 300);
        }, 5000);
      }
    } catch (err) {
      setErrors({ username: 'Failed to validate username. Please try again.' });
      setShowError({ username: true });
  
      setTimeout(() => {
        setShowError({ username: false });
        setTimeout(() => setErrors({ username: '' }), 300);
      }, 5000);
    }
  };

  return (
    <div className={`signup-step-one ${animationClass}`}>
      {/* <div className='logo-container'>
        <img src="/Logo-Inflated2.png" alt="Reach Logo" className="signup-logo" />
      </div> */}
      <div className='content-area'>
        <div className='username-box'>
          <CustomInput
            label="Username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            inputType="name"
            wrap={false}
            count={false}
            errorMessage={errors.username}
            errorVisible={showError.username}
            maxChar={30}
          />
          <p className="username-info">
            Who are you?
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

export default UsernameStep;
