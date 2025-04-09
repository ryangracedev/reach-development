import React from 'react';
import { useEventContext } from '../../context/EventContext';
import CustomButton from '../../components/common/CustomButton';
import EventStack from '../../components/common/EventStack';
import './style/AuthRequired.css';

const AuthRequired = ({ nextStep }) => {
    const { eventData } = useEventContext();

    // Handle Next Click
    const handleNext = () => {
        
        nextStep(); // Advances to the next step in CreateEvent.js
    };

    const imageUrl = eventData.image instanceof File
        ? URL.createObjectURL(eventData.image) // Convert File object to a URL
        : eventData.image || '/default-image.jpg'; // Use stored URL or fallback

    console.log("Final Image URL:", imageUrl); // DEBUG
    console.log("Event Name: ", eventData.name)

    return (
        <div className="auth-required">
            <div className='create-an-account'>
                <div className='page-headings'>
                    <h1 className="auth-title">To post a party,<br/>you have to create<br/>an account.</h1>
                    <p className="auth-subtext">It also lets you accept<br/>other events.</p>
                </div>
                {/* Event Stack Component */}
                <EventStack
                    image={imageUrl}
                    name={eventData.name}
                    description={eventData.description}
                    dateTime={eventData.dateTime}
                />
            </div>
            <CustomButton className="next-btn" text="OK" onClick={handleNext} />
        </div>
    );
};

export default AuthRequired;