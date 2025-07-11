import React, { useState } from 'react';
import { useAuth} from '../../context/AuthContext';
import './style/SignupPage.css'; // Import the CSS file
import './style/VerificationStep.css'; // Import page CSS file
import CustomBack from '../common/CustomBack';
import CustomHollow from '../common/CustomButtonHollow';
import CustomButton from '../common/CustomButton';
import '../../animations/animations.scss';

const VerificationStep = ({ formData, prevStep, updateFormData, nextStep, handleSignupComplete, transitioning, transitionDirection, fadeIn }) => {
  const { signIn } = useAuth(); // Access the signIn function from AuthContext
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({ code: '' });
  const [showError, setShowError] = useState({ code: false });

  let animationClass = '';

  if (transitioning) {
    animationClass = transitionDirection === 'forward' ? 'slideLeft' : 'slideRight';
  } else if (fadeIn) {
    animationClass = 'fade-in';
  }

  // For Testing
  console.log('Final Form Data:\n', formData);

  // ===========================
  // Handle verification code submission
  // ===========================
  const handleVerify = async () => {

    // Add verification code in form data
    updateFormData('verificationCode', code);

    // For Testing
    console.log('Phone Number:', formData.phoneNumber);

    if (!code.trim()) {
      setErrors({ code: 'Code is required' });
      setShowError({ code: true });
      setTimeout(() => {
        setShowError({ code: false });
        setTimeout(() => setErrors({ code: '' }), 300);
      }, 5000);
      return;
    }

    // Check if verification code is vaild
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phoneNumber,
          code: code,
        }),
      });

      // Check if user exists and code is correct
      if (response.ok) {
        const result = await response.json();

        // For Testing
        console.log('Verification Successful:', result);

        // ===========================
        // Make the signup API call
        // ===========================
        const signupResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            phone_number: formData.phoneNumber,
          }),
        });

        if (signupResponse.ok) {
          const result = await signupResponse.json();

          // For Testing
          console.log('Signup Successful:', result);

          // Store the token in localStorage
          //localStorage.setItem('authToken', result.access_token);

          console.log("Result: ", result);
          // Sign user in
          signIn(result.access_token);

          // User is now signed up
          if (handleSignupComplete) {
            handleSignupComplete(); // For signup flow
          } else {
            nextStep(); // For other flows like creating a party
          }

        } else {
          const errorResponse = await signupResponse.json();
          setErrors({ code: errorResponse.error || 'Signup failed' });
          setShowError({ code: true });
          setTimeout(() => {
            setShowError({ code: false });
            setTimeout(() => setErrors({ code: '' }), 300);
          }, 5000);
        }

      } else {
        const errorResponse = await response.json();
        setErrors({ code: errorResponse.error || 'Verification failed' });
        setShowError({ code: true });
        setTimeout(() => {
          setShowError({ code: false });
          setTimeout(() => setErrors({ code: '' }), 300);
        }, 5000);
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setErrors({ code: 'An error occurred while verifying the code. Please try again.' });
      setShowError({ code: true });
      setTimeout(() => {
        setShowError({ code: false });
        setTimeout(() => setErrors({ code: '' }), 300);
      }, 5000);
    }
  };

  // ===========================
  // Handle re-sending the code
  // ===========================
  const handleResendCode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: formData.username,
          phone_number: formData.phoneNumber
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // For Testing
        console.log('Code Resent:', result);
        alert('Verification code resent to your phone.');
      } else {
        const errorResponse = await response.json();
        setErrors({ code: errorResponse.error || 'Failed to resend code' });
        setShowError({ code: true });
        setTimeout(() => {
          setShowError({ code: false });
          setTimeout(() => setErrors({ code: '' }), 300);
        }, 5000);
      }
    } catch (err) {
      console.error('Error resending code:', err);
      setErrors({ code: 'An error occurred while resending the code. Please try again.' });
      setShowError({ code: true });
      setTimeout(() => {
        setShowError({ code: false });
        setTimeout(() => setErrors({ code: '' }), 300);
      }, 5000);
    }
  };

  return (
    <div className={`signup-step-four ${animationClass}`}>
      {/* <div className='logo-container'>
        <img src="/Logo-Inflated2.png" alt="Reach Logo" className="signup-logo" />
      </div> */}
      <div className='content-area'>
        <div className='verification-box'>
          <input
            type="text"
            placeholder="Code"
            value={code}  // Ensure it's always a string
            className='user-input-verification'
            onChange={(e) => setCode(e.target.value)}
          />
          <div className={`error-message-container ${showError.code ? 'visible' : ''}`}>
            {errors.code && <p className='error-message'>{errors.code}</p>}
          </div>
          <p className="verification-info">  {/* Feature: hide the first 2 parts of the phone number */}
            We sent a code to {formData.phoneNumber},   
            enter it above.
          </p>
          <button className="resend-code" onClick={handleResendCode}>
            Resend Code
          </button>
        </div>
      </div>
      <div className='nav'>
        <CustomBack className="back-btn" onClick={prevStep} color='white' />
        <CustomButton className="next-btn" text="Next" onClick={handleVerify} color="black" />
      </div>
    </div>
  );
};

export default VerificationStep;
