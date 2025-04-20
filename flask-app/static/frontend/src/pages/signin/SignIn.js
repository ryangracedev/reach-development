import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Use the AuthContext for managing authentication
import { useNavigate, useLocation } from 'react-router-dom';
import "./style/SignIn.scss";
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/common/CustomInput';

const SignIn = () => {
  const { signIn } = useAuth(); // Access the signIn function from AuthContext
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [showError, setShowError] = useState({ username: false, password: false });
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoaded(true);
  
    return () => {
      setLoaded(false); // Reset loaded to false when navigating away
    };
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrors({ username: '', password: '' });
    setShowError({ username: false, password: false });

    let hasError = false;
    const newErrors = { username: '', password: '' };
    const newShowError = { username: false, password: false };

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      newShowError.username = true;
      hasError = true;
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      newShowError.password = true;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setShowError(newShowError);
      setTimeout(() => {
        setShowError({ username: false, password: false });
        setTimeout(() => setErrors({ username: '', password: '' }), 300);
      }, 5000);
      return;
    }

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
          setErrors({ username: errorData.error || 'Sign-in failed', password: '' });
          setShowError({ username: true, password: false });
          setTimeout(() => {
            setShowError({ username: false });
            setTimeout(() => setErrors({ username: '', password: '' }), 300);
          }, 5000);
        }
      } catch (err) {
        console.error('Error during sign-in:', err);
        setErrors({ username: 'An error occurred. Please try again.', password: '' });
        setShowError({ username: true, password: false });
        setTimeout(() => {
          setShowError({ username: false });
          setTimeout(() => setErrors({ username: '', password: '' }), 300);
        }, 5000);
      }
  };

  return (
    <div className="sign-in-page">
      {/* Removed error message display */}

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
            errorMessage={errors.username}
            errorVisible={showError.username}
          />
        </div>

        <div id='custom-input' className={`password-input ${loaded ? 'stack-down' : ''}`}>
          <CustomInput
            label="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage={errors.password}
            errorVisible={showError.password}
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