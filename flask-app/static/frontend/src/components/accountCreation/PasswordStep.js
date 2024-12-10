import React, { useState } from 'react';
import './style/SignupPage.css'; // Import the CSS file

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

const PasswordStep = ({ nextStep, updateFormData }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div>
      <h2>Create a Password</h2>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error */}
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default PasswordStep;
