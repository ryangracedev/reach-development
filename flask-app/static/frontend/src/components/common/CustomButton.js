import React from 'react';
import './style/CustomButton.css'; // Import the styles

const CustomButton = ({ text, onClick }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      <span className="button-text">{text}</span>
      <div className="button-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* <img src={require('../../assets/3d-arrow-back.png')} alt="Next" /> */}
      </div>
    </button>
  );
};

export default CustomButton;