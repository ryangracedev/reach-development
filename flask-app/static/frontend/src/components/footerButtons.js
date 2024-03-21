import React from 'react';
import { useEvent } from '../context/eventContext'; // Import useEvent
import CheckMarkBtn from './checkMarkBtn';
import BackBtn from './backBtn';
import '../styles/footerButtons.css'

function Footer() {

    const { eventData } = useEvent();

    // A simplified handleSubmit that could be moved to App.js or another component
    const handleSubmit = async () => {
        console.log(eventData); // Here you can also perform the fetch operation
        // Assuming fetch operation is moved to App.js or triggered when all data is collected
    };

    return (
        <div className="Footer">
            <BackBtn />
            <CheckMarkBtn  classNameBtn = 'Check' classNameDuo = 'Yes' text = 'Next' onClick={handleSubmit}/>
        </div>
    );
}

export default Footer;