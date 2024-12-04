import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { EventProvider } from './context/EventContext'; // Import EventProvider
import CreateEvent from './pages/create-event/CreateEvent';
import HomePage from './pages/home/HomePage';
import EventPage from './pages/create-event/EventPage';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import SignIn from './pages/signin/SignIn';

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
          </Routes>
        </EventProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
