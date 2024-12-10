import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Use the AuthContext for managing authentication
import { useNavigate } from 'react-router-dom';

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/signin`, {
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignIn}>
        <div>
          <label style={{ color: 'white' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={{ color: 'white' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
      <a href="/forgot-password">Forgot Password?</a>
      <h2>Don’t have an account?</h2>
      <button onClick={() => navigate('/signup')} style={{ marginLeft: '8px' }}>
        Sign Up
      </button>
    </div>
  );
};

export default SignIn;