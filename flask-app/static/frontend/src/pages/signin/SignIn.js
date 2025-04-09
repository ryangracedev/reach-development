import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Use the AuthContext for managing authentication
import { useNavigate } from 'react-router-dom';
import "./style/SignIn.scss";
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/common/CustomInput';

const SignIn = () => {
  const { signIn } = useAuth(); // Access the signIn function from AuthContext
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

    useEffect(() => {
      setLoaded(true);
    }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Sign-in successful:', data);
        localStorage.setItem('jwtToken', data.access_token); // Save JWT token
        signIn(data.access_token); // Update AuthContext

        console.log("jwtToken: ", localStorage.getItem('jwtToken'));
        navigate('/'); // Redirect to the homepage
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Sign-in failed');
      }
    } catch (err) {
      console.error('Error during sign-in:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="sign-in-page">
      {error && <p className="error-message">{error}</p>}

      <div className={`sign-in-label ${loaded ? 'stack-down-logo' : ''}`}>
          <img src="/Reach_Logo_Full.png" alt="Reach Logo" className="logo-signin" />
          {/* <h2>LOG IN</h2> */}
      </div>

      <form onSubmit={handleSignIn} className="sign-in-form">

        <div id='custom-input' className={`username-input ${loaded ? 'stack-down' : ''}`}>
          <CustomInput
            label="Username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div id='custom-input' className={`password-input ${loaded ? 'stack-down' : ''}`}>
          <CustomInput
            label="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <a href="/forgot-password" className={`forgot-password-link ${loaded ? 'stack-down' : ''}`}>Forgot Password?</a>

        <div className={`signup-container ${loaded ? 'stack-down' : ''}`}>
          {/* <div className="custom-input-underline" /> */}
          <button onClick={() => navigate('/signup')} className="sign-up-button">
            <p>Don’t have an account?</p>
            <div className='sign-up-group'>
              <p id='text'>Sign Up</p>
              <svg xmlns="http://www.w3.org/2000/svg" width="9.023" height="14.088" viewBox="0 0 9.023 14.088">
                <g id="Group_71" data-name="Group 71" transform="translate(-134.713 -457.047)">
                  <rect id="Rectangle_92" data-name="Rectangle 92" width="2.876" height="9.885" rx="1.438" transform="translate(134.713 459.081) rotate(-45)" fill="#fff"/>
                  <rect id="Rectangle_93" data-name="Rectangle 93" width="2.876" height="9.817" rx="1.438" transform="translate(141.703 462.16) rotate(45)" fill="#fff"/>
                </g>
              </svg>
            </div>
          </button>
        </div>
      </form>

      <div className={`sign-in-nav ${loaded ? 'stack-down' : ''}`}>
        <CustomButton className="next-btn" text="Log In" onClick={handleSignIn} color="white" />
      </div>
    </div>
  );
};

export default SignIn;