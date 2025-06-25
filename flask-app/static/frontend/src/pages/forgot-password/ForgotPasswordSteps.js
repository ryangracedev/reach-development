import React, { useState } from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import CustomBack from '../../components/common/CustomBack';
import './style/ForgotPasswordSteps.css'; // Assuming you style similarly to UsernameStep

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
        setStep(2);
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'Failed to send code.');
      }
    } catch (err) {
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
        setStep(3);
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'Invalid code.');
      }
    } catch (err) {
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
        window.location.href = '/signin';
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="forgot-password-page__container">
      <div className="content-area">
        {step === 1 && (
          <div className="username-box">
            <CustomInput
              label="Phone Number"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              inputType="tel"
              wrap={false}
              count={false}
              errorMessage=""
              errorVisible={false}
            />
          </div>
        )}

        {step === 2 && (
          <div className="username-box">
            <CustomInput
              label="Verification Code"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              inputType="text"
              wrap={false}
              count={false}
              errorMessage=""
              errorVisible={false}
            />
          </div>
        )}

        {step === 3 && (
          <div className="username-box">
            <CustomInput
              label="New Password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              inputType="password"
              wrap={false}
              count={false}
              errorMessage=""
              errorVisible={false}
            />
            <CustomInput
              label="Confirm Password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              inputType="password"
              wrap={false}
              count={false}
              errorMessage=""
              errorVisible={false}
            />
          </div>
        )}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="nav">
        <CustomBack
          className="back-btn"
          onClick={() => {
            if (step === 1) {
              window.history.back();
            } else {
              setStep(step - 1);
            }
          }}
          color="white"
        />
        <CustomButton
          className="next-btn"
          text={step === 3 ? 'Reset Password' : 'Next'}
          onClick={
            step === 1
              ? handleSendCode
              : step === 2
              ? handleVerifyCode
              : handleResetPassword
          }
          color="black"
        />
      </div>
    </div>
  );
};

export default ForgotPasswordSteps;