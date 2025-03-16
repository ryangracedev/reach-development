import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Use the AuthContext for managing authentication
import { useNavigate } from 'react-router-dom';
import "./style/SignIn.css";

const SignIn = () => {
  const { signIn } = useAuth(); // Access the signIn function from AuthContext
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      <h2>Sign In</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSignIn} className="sign-in-form">
        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="sign-in-button">Sign In</button>
      </form>

      <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>

      <div className="signup-container">
        <p>Don’t have an account?</p>
        <button onClick={() => navigate('/signup')} className="sign-up-button">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignIn;