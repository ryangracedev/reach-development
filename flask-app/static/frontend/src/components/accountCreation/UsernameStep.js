import React, { useState } from 'react';
import './style/SignupPage.css'; // Import the CSS file

const UsernameStep = ({ nextStep, updateFormData }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false); // To show a loading indicator while checking

  const handleNext = async () => {
    // Frontend validation: Ensure the username is not empty
    if (!username.trim()) {
      setError('Username is required'); // Frontend validation
      return;
    }

    setError(''); // Clear previous errors
    setIsChecking(true); // Show loading indicator

    try {
      // Make API call to check if the username exists
      const response = await fetch(`${process.env.REACT_APP_API_URL}/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setError('Username already exists');
        } else {
          // Username is valid, proceed to the next step
          updateFormData('username', username);
          nextStep();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('Failed to validate username. Please try again.');
      console.error('Error checking username:', err);
    } finally {
      setIsChecking(false); // Hide loading indicator
    }
  };

  return (
    <div>
      <h2>Enter Your Username</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleNext} disabled={isChecking}>
        {isChecking ? 'Checking...' : 'Next'}
      </button>
    </div>
  );
};

export default UsernameStep;
