import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/backBtn.css'

function BackBtn() {

    const navigate = useNavigate(); // Get the navigate function
    return (
        <div 
        className="Back-Button" 
        onClick={() => navigate(-1)}
        tabIndex="0" // Make it focusable
        role="button" // ARIA role
        aria-label="Go back" // ARIA label
        >

        </div>
    );
}

export default BackBtn;