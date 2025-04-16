import React, { useState } from 'react';
import './style/SignupPage.css'; // Import the CSS file
import './style/PhoneStep.css'; // Import page CSS file
import CustomBack from '../common/CustomBack';
import CustomHollow from '../common/CustomButtonHollow';
import CustomButton from '../common/CustomButton';
import CustomInput from '../common/CustomInput'; // Import CustomInput
import '../../animations/animations.scss';

const PhoneStep = ({ formData, prevStep, updateFormData, nextStep, transitioning, transitionDirection, fadeIn }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false); // To show a loading indicator while checking

  let animationClass = '';

  if (transitioning) {
    animationClass = transitionDirection === 'forward' ? 'slideLeft' : 'slideRight';
  } else if (fadeIn) {
    animationClass = 'fade-in';
  }

  const handleNext = async () => {


    // For Testing
    console.log("Form Data In PhoneStep.js:\n", formData)
    // Frontend validation: Ensure the phone number is not empty
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }


    // Clear previous errors
    setError('');
     // Show loading indicator
    setIsChecking(true);


    // Check if phone number exits
    try {

      // Make API call to check if the phone number exists
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/check-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      // Check if response is vaild
      if (response.ok) {
        // Get response data
        const data = await response.json();
        // Check if data exists in DB
        if (data.exists) {
          setError('Phone number already exists');
        } else {

          // Phone number is valid, proceed to the next step
          updateFormData('phoneNumber', phoneNumber);

          // Call /send-verification to send the code
          const verificationResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/send-verification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: formData.username,
              phone_number: phoneNumber,
            }),
          });

          // Check if /send-verification was successful
          if (verificationResponse.ok) {
            console.log('Verification code sent successfully');
            // Go to verification step
            nextStep();
          } else {
            const verificationError = await verificationResponse.json();
            setError(verificationError.error || 'Failed to send verification code');
          }

        }
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      console.error('Error checking phone number:', err);
      setError('Failed to validate phone number. Please try again.');
    } finally {
      setIsChecking(false); // Hide loading indicator
    }
  };

  return (
    <div className={`signup-step-three ${animationClass}`}>
      {/* <div className='logo-container'>
        <img src="/Logo-Inflated2.png" alt="Reach Logo" className="signup-logo" />
      </div> */}
      <div className='content-area'>
        <div className='phone-box'>
          <CustomInput
            label="Phone Number"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            inputType="name"
            wrap={false}
            count={false}
          />
          <p className="phone-info">
            To verify you.
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

export default PhoneStep;
