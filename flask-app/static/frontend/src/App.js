import React from 'react';
import './App.css';
import HomePage from './pages/homePage';
import CreateParty from './pages/createPartyOne';
import CreatePartyTwo from './pages/createPartyTwo';
import SignIn from './pages/signin';
import Signup from './pages/signup/Signup';
import { Routes, Route } from 'react-router-dom';
import { EventProvider } from './context/eventContext'; // Import EventProvider

function App() {

  return (
    <div className="App">
      <EventProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-party" element={<CreateParty />} />
          <Route path="/create-party-extra" element={<CreatePartyTwo />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </EventProvider>
    </div>
  );
}

export default App;
