import React, { useState } from 'react';

const PhoneStep = ({ formData, updateFormData, nextStep }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false); // To show a loading indicator while checking

  const handleNext = async () => {
    // Frontend validation: Ensure the phone number is not empty
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    setError(''); // Clear previous errors
    setIsChecking(true); // Show loading indicator

    try {
      // Make API call to check if the phone number exists
      const response = await fetch(`${process.env.REACT_APP_API_URL}/check-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setError('Phone number already exists');
        } else {
          // Phone number is valid, proceed to the next step
          updateFormData('phoneNumber', phoneNumber);

          // Make the signup API call
          const signupResponse = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: formData.username,
              password: formData.password,
              phone_number: phoneNumber,
            }),
          });

          if (signupResponse.ok) {
            const result = await signupResponse.json();
            console.log('Signup Successful:', result); // Debugging
            nextStep(); // Move to verification step
          } else {
            const errorResponse = await signupResponse.json();
            setError(errorResponse.error || 'Signup failed');
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
    <div>
      <h2>Enter Your Phone Number</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={handleNext} disabled={isChecking}>
        {isChecking ? 'Checking...' : 'Next'}
      </button>
    </div>
  );
};

export default PhoneStep;
