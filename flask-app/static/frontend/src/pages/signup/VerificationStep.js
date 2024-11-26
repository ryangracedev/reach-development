import React, { useState } from 'react';

const VerificationStep = ({ formData, updateFormData, nextStep }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  console.log('Final Form Data:', formData); // Debugging purpose

  // Handle verification code submission
  const handleVerify = async () => {
    updateFormData('verificationCode', code);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          code: code,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Verification Successful:', result); // Debugging
        nextStep(); // Proceed to the next step
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'Verification failed');
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('An error occurred while verifying the code. Please try again.');
    }
  };

  // Handle re-sending the code
  const handleResendCode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.username }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Code Resent:', result); // Debugging
        alert('Verification code resent to your phone.');
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'Failed to resend code');
      }
    } catch (err) {
      console.error('Error resending code:', err);
      setError('An error occurred while resending the code. Please try again.');
    }
  };

  return (
    <div>
      <h2>Verify Your Phone Number</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Enter Verification Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleVerify}>Verify</button>
      <button onClick={handleResendCode}>Send Again</button>
    </div>
  );
};

export default VerificationStep;
