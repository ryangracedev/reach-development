import React from 'react';
import './App.scss';
import { Routes, Route } from 'react-router-dom';
import { EventProvider } from './context/EventContext'; // Import EventProvider
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { useEffect } from 'react';
import CreateEvent from './pages/create-event/CreateEvent';
import HomePage from './pages/home/HomePage';
import EventPage from './pages/create-event/EventPage';
import SignIn from './pages/signin/SignIn';
import SignupForEvent from './pages/signup/SignupForEvent';
import Profile from './pages/profile/Profile';
import ForgotPasswordSteps from './pages/forgot-password/ForgotPasswordSteps';
import Signup from './pages/signup/Signup';
import AuthRequired from './pages/create-event/AuthRequired';
import SignupAuthRequired from './pages/signup/SignupAuthRequired';

function App() {

  useEffect(() => {
    const setVhUnit = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVhUnit();
    window.addEventListener('resize', setVhUnit);
    return () => window.removeEventListener('resize', setVhUnit);
  }, []);

  console.log('App is rendering'); // Debugging

  return (
    <div>
      {/* <div className="gradient-bg">
        <svg>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="atop" />
        </filter>
        </svg>
        <div className="gradients-container">
          <div className="g1"></div>
          <div className="g2"></div>
          <div className="g3"></div>
          <div className="g4"></div>
          <div className="g5"></div>
          <div className="interactive"></div>
        </div>
      </div> */}
      {/* <div class="loading-box-container">
        <div class="loading-box"></div>
      </div> */}

      <div className="App">
        <AuthProvider>
          <EventProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/:eventName" element={<EventPage />} /> {/* Dynamic event page */}
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/signin" element={<SignIn />} /> {/* Sign In route */}
              <Route path="/signup-for-event" element={<SignupForEvent />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/forgot-password" element={<ForgotPasswordSteps />} />
              <Route path="/auth-required" element={<AuthRequired />} />
              <Route path="/signup-auth-required" element={<SignupAuthRequired />} />
            </Routes>
          </EventProvider>
        </AuthProvider>
      </div>
    </div>
  );
}

export default App;
