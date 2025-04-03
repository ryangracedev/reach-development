import React from 'react';
import './style/CustomBack.css'; // Import the styles

const CustomBack = ({ onClick, color = "white" }) => { // Default to white
  return (
    <button className="custom-button" onClick={onClick}>
      <div className="back-button-icon"> {/* Dynamic border */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* <img src={require('../../assets/3d-arrow-back.png')} alt="Back" /> */}
      </div>
    </button>
  );
};

export default CustomBack;