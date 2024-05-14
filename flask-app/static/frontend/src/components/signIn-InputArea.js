import React from 'react';
import SignInInput from '../components/signinInput';
import '../styles/signIn-InputArea.css'

function SignInInputArea() {

  return (
    <div className="Sign-In-Input-Area">
        <SignInInput type="username" placeholder="Username" />
        <SignInInput type="password" placeholder="Password" />
    </div>
  );
}

export default SignInInputArea;
