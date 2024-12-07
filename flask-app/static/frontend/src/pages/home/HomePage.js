import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Use AuthContext
import './style/HomePage.css'; // Import the CSS file

const HomePage = () => {
  const navigate = useNavigate();
  const { authState, signOut } = useAuth(); // Access authState and signOut from AuthContext

  const handleSignIn = () => {
    navigate('/signin'); // Redirects to the sign-in page
  };

  return (
    <div className="home-page">
      <h1>Welcome to Reach</h1>
      <p>Create and manage your events with ease.</p>
      <div className="home-buttons">
        <button onClick={() => navigate('/create-event')} className="create-event-btn">
          Create a Party
        </button>
        {authState.isAuthenticated ? (
          <div>
            <p>Welcome, {authState.username}!</p>
            <button onClick={signOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={handleSignIn} className="sign-in-btn">
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePage;  