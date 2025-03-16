import React from 'react';
import { Link } from 'react-router-dom';
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
      <div>
        <img src="/Logo-Inflated2.png" alt="Reach Logo" className="logo" />
      </div>
      <button onClick={() => navigate('/create-event')} className="create-event-btn">
        CREATE A PARTY
      </button>
      <div className="home-buttons">
        {authState.isAuthenticated ? (
          <div>
            <p>
              Logged in as <Link to={`/profile/${authState.username}`}>{authState.username}</Link>
            </p>
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