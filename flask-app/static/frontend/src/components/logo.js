import React from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/logo.css';

function Logo() {

    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async () => {
        navigate('/'); // Navigate to CreatePartyTwo
    };

    return (
        <div className="Full-Logo" onClick={handleSubmit}>
            <div className="Reach-Logo"></div>
            <h1 className='Reach-Text'>REACH</h1>
        </div>
    )
}

export default Logo;