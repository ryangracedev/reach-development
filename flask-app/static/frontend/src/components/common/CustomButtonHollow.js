import React from 'react';
import './style/CustomeHollow.css'; // Ensure correct import path

const CustomButtonHollow = ({ text, onClick }) => {
  return (
    <button className="custom-button-hollow" onClick={onClick}>
      <span className="button-text-hollow">{text}</span>
      <div className="button-icon-hollow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
};

export default CustomButtonHollow;