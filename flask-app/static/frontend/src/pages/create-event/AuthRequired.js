import React from 'react';
import { useEventContext } from '../../context/EventContext';
import './style/AuthRequired.css';
import CustomButton from '../../components/common/CustomButton';

const AuthRequired = ({ nextStep }) => {
    const { eventData } = useEventContext();

    // Handle Next Click
    const handleNext = () => {
        
        nextStep(); // Advances to the next step in CreateEvent.js
    };

    const formatEventDate = (isoString) => {
        const date = new Date(isoString);

        // Format the date (e.g., "SEP 3")
        const formattedDate = new Intl.DateTimeFormat('en-US', { 
            month: 'short', day: 'numeric' 
        }).format(date).toUpperCase();

        // Format the time (e.g., "9:30PM")
        const formattedTime = new Intl.DateTimeFormat('en-US', { 
            hour: 'numeric', minute: '2-digit', hour12: true 
        }).format(date).replace(' ', '').toUpperCase();

        return `${formattedDate}, ${formattedTime}`;
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

                {/* Event Preview Card */}
                <div className="event-preview">
                    <img src={imageUrl || '/default-image.jpg'} alt="Event" className="event-preview-image" />
                    <div className="event-preview-info">
                    <p className="event-preview-date">{eventData.dateTime ? formatEventDate(eventData.dateTime) : "Event Date"}</p>
                    <h2 className="event-preview-title">{eventData.name || "Event Title"}</h2>
                    <p className="event-preview-description">{eventData.description || "Event description"}</p>
                    </div>
                </div>
            </div>

            <CustomButton className="next-btn" text="OK" onClick={handleNext} />
        </div>
    );
};

export default AuthRequired;