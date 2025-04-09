import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Use AuthContext
import './style/HomePage.scss'; // Import the CSS file


const HomePage = () => {
  const navigate = useNavigate();
  const { authState, signOut } = useAuth(); // Access authState and signOut from AuthContext
  const [animateExit, setAnimateExit] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleSignIn = () => {
    navigate('/signin'); // Redirects to the sign-in page
  };

  return (
    <div className={`home-page ${loaded ? 'fade-in' : ''}`}>
      {/* <video
        className="logo"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/reach-rotate.mov" type="video/quicktime" />
        <source src="/reach-rotate.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video> */}




      {/* CREATE A PARTY Section */}
      <button 
        onClick={() => { 
          setAnimateExit(true); 
          setClicked(true); 
          setTimeout(() => {
            navigate('/create-event')
            }, 500);
          }} 
          className={`create-event-btn ${clicked ? 'clicked' : ''}`}
      >
       
        <video
          className="create-a-party-model"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/model_test.mp4" type="video/mp4" />
          {/* <source src="/reach-rotate.mov" type="video/quicktime" />
          <source src="/reach-rotate.webm" type="video/webm" /> */}
          Your browser does not support the video tag.
        </video>

      </button>


      {/* Bottom Button Section */}
      <div className={`home-buttons ${animateExit ? 'home-buttons-exit' : ''}`}>

        {/* Top Logo Section */}
        <div onClick={signOut} className={`logo-container ${animateExit ? 'logo-exit' : ''}`}>
          <img src="/Reach_Logo_Full.png" alt="Reach Logo" className="logo" />
        </div>
        {authState.isAuthenticated ? (
          <div className='bottom-button'>
            <h3 id='bottom-button-text'>
              @<Link to={`/profile/${authState.username}`}>{authState.username}</Link>
            </h3>
          </div>
        ) : (
          <div onClick={handleSignIn} className="bottom-button">
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

// {`nav ${loaded ? 'fade-in' : ''}`}