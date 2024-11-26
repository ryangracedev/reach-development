import React, { useState } from 'react';

const PasswordStep = ({ nextStep, updateFormData }) => {
  const [password, setPassword] = useState('');

  const handleNext = () => {
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
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default PasswordStep;
