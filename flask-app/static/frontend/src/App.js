import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { EventProvider } from './context/EventContext'; // Import EventProvider
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import CreateEvent from './pages/create-event/CreateEvent';
import HomePage from './pages/home/HomePage';
import EventPage from './pages/create-event/EventPage';
import SignIn from './pages/signin/SignIn';
import SignupForEvent from './pages/signup/SignupForEvent';
import Profile from './pages/profile/Profile';
import ForgotPasswordSteps from './pages/forgot-password/ForgotPasswordSteps';
import Signup from './pages/signup/Signup';

function App() {

  console.log('App is rendering'); // Debugging

  return (
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

          </Routes>
        </EventProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
