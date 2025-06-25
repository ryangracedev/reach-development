import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Use AuthContext
import './style/HomePage.scss'; // Import the CSS file
import '../../animations/animations.scss'

const HomePage = () => {
  const navigate = useNavigate();
  const { authState, signOut } = useAuth(); // Access authState and signOut from AuthContext
  const [animateExit, setAnimateExit] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // This ensures animations always reset when you return to homepage
    setLoaded(false);
    const timeout = setTimeout(() => {
      setLoaded(true);
      setAnimateExit(false); // Reset any lingering exit animation
      setClicked(false);     // Reset clicked state if needed
    }, 10); // small timeout to re-trigger CSS animation
  
    return () => clearTimeout(timeout); // cleanup
  }, [location]);

  const handleSignIn = () => {
    navigate('/signin'); // Redirects to the sign-in page
  };

  return (
    <div className={`home-page`}>
      <div className="home-page__background-video-container">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="home-page__create-party-background-video"
        >
          <source src="/yellow-flash.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>




      {/* CREATE A PARTY Section */}
      <button 
        onClick={() => {
          setClicked(true);
          requestAnimationFrame(() => {
            setAnimateExit(true);
            setTimeout(() => {
              navigate('/create-event');
            }, 500);
          });
        }} 
        className={`home-page__create-event-btn fade-in-slowed ${clicked ? 'clicked' : ''}`}
      >
       
        {/* <video
          className="home-page__create-a-party-model"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/model_test.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}

        <h1 className='home-page__create-a-party-text'>CREATE A<br/>PARTY.</h1>

      </button>


      {/* Bottom Button Section */}
      <div className="home-buttons">

        {/* Top Logo Section */}
        <div onClick={signOut} className={`logo-container ${loaded ? 'fade-in-slowed' : ''} ${animateExit ? 'button-leave' : ''}`}>
          <img src="/Reach_Logo_Full.png" alt="Reach Logo" className="logo" />
        </div>
        {authState.isAuthenticated ? (
          <div className={`bottom-button ${loaded ? 'fade-in-slowed' : ''} ${animateExit ? 'button-leave' : ''}`}>
            <h3 id='bottom-button-text'>
              @<Link to={`/profile/${authState.username}`}>{authState.username}</Link>
            </h3>
          </div>
        ) : (
          <div onClick={handleSignIn} className={`bottom-button ${loaded ? 'fade-in-delayed-1' : ''} ${animateExit ? 'button-leave' : ''}`}>
            <h3 id='bottom-button-text'>Login.</h3>
          </div>
        )}
      </div>



    </div>
  );
};

export default HomePage;  


// {`sign-in-label ${loaded ? 'fade-in' : ''}`}

// {`username-input ${loaded ? 'fade-in' : ''}`}

// {`password-input ${loaded ? 'fade-in' : ''}`}

// {`forgot-password-link ${loaded ? 'fade-in' : ''}`}

// {`signup-container ${loaded ? 'fade-in' : ''}`}

// {`nav ${loaded ? 'fade-in' : ''}`}</file>



          {/* <source src="/reach-rotate.mov" type="video/quicktime" />
          <source src="/reach-rotate.webm" type="video/webm" /> */}