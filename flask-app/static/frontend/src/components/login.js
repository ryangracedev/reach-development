import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/login.css';

function Login() {

  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async () => {
    navigate('/signin')
  };

  return (
    <div className="Login-Btn" onClick={handleSubmit}>
      <h1 className='Login-Btn-Text'>SIGN IN</h1>
    </div>
  );
}

export default Login;