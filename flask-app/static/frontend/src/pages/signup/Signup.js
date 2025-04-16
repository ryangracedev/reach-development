import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupSteps from './SignupSteps'; // Re-use the same component
import './style/Signup.css'

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [transitioning, setTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoaded(true);
    setFadeIn(true);
  }, []);

  const nextStep = () => {
    setTransitionDirection('forward');
    setTransitioning(true);
    setFadeIn(false); // reset fade in
    setTimeout(() => {
      setStep((prev) => prev + 1);
      setTransitioning(false);
      setFadeIn(true); // trigger fade-in for new content
    }, 300);
  };
  const prevStep = () => {
    if (step === 1) {
      navigate('/signin');
      return;
    }
    setTransitionDirection('backward');
    setTransitioning(true);
    setFadeIn(false); // reset fade in
    setTimeout(() => {
      setStep((prev) => prev - 1);
      setTransitioning(false);
      setFadeIn(true); // trigger fade-in for new content
    }, 300);
  };

  // Instead of passing key and value separately, it might be simpler to use an object approach:
  const updateFormData = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSignupComplete = () => {
    // After the user finishes all signup steps, decide where to navigate
    // For instance, you can send them to the sign-in page or directly to a profile page.
    // navigate('/signin');
    // or if you have a profile route and can access username from formData:
    // navigate(`/profile/${formData.username}`);
    navigate('/');
  };

  return (
    <div className="signup-home">
      <SignupSteps
        currentStep={step}
        nextStep={nextStep}
        prevStep={prevStep}
        updateFormData={updateFormData}
        formData={formData}
        handleSignupComplete={handleSignupComplete}
        transitioning={transitioning}
        transitionDirection={transitionDirection}
        fadeIn={fadeIn}
      />
    </div>
  );
};

export default Signup;