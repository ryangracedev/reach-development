import React from 'react';
import '../styles/signinInput.css'

const SignInInput = ({ type, placeholder }) => {
    const inputType = type === 'password' ? 'password' : 'text';
    
    return (
      <div className="Sign-In-Input-Container">
        <input className="Styled-Sign-In-Input" type={inputType} placeholder={placeholder} />
      </div>
    );
};

export default SignInInput;
