import React from 'react';
import { useEvent } from '../context/eventContext'; // Import useEvent
import Logo from '../components/logo';
import SignInArea from '../components/signIn-InputArea'
import CheckMarkBtn from '../components/checkMarkBtn';
import CreateAccountBtn from '../components/createAccountBtn';
import './signin.css'

function SignIn() {

  const { eventData } = useEvent();

  return (
        <div className="Sign-In">
            <Logo />
            <SignInArea />
            <CheckMarkBtn classNameBtn = 'Done' classNameDuo = 'Yes' text = 'SIGN IN'/>
            <h1 className='Forgot-Password'>Forgot Password</h1>
            <CreateAccountBtn text = 'CREATE ACCOUNT' />
        </div>
  );
}

export default SignIn;
