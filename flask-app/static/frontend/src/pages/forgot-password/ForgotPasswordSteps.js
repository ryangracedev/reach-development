import React, { useState } from 'react';

const ForgotPasswordSteps = () => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/forgot-password/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      if (response.ok) {
        setStep(2); // Move to the next step
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'Failed to send code.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/forgot-password/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, code: verificationCode }),
      });

      if (response.ok) {
        setStep(3); // Move to the next step
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'Invalid code.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/forgot-password/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, new_password: newPassword }),
      });

      if (response.ok) {
        alert('Password reset successfully. Redirecting to sign-in page.');
        window.location.href = '/signin'; // Redirect to sign-in page
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <h2>Enter Your Phone Number</h2>
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button onClick={handleSendCode}>Send Code</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Enter Verification Code</h2>
          <input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button onClick={handleVerifyCode}>Verify Code</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Reset Your Password</h2>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handleResetPassword}>Reset Password</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ForgotPasswordSteps;