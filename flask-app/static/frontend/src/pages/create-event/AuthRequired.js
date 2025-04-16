import React from 'react';
import { useEventContext } from '../../context/EventContext';
import CustomButton from '../../components/common/CustomButton';
import EventStack from '../../components/common/EventStack';
import './style/AuthRequired.css';
import '../../animations/animations.scss';

const AuthRequired = ({ nextStep, transitioning, transitionDirection }) => {
    const { eventData } = useEventContext();

    const animationClass = transitioning
    ? transitionDirection === 'forward'
      ? 'slideLeft'
      : 'slideRight'
    : '';  

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
        <div className={`auth-required ${animationClass}`}>
            <div className='create-an-account'>
                <div className='page-headings fade-in'>
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
            <div className='auth-nav fade-in'>
                <CustomButton className="next-btn" text="OK" onClick={handleNext} />
            </div>
        </div>
    );
};

export default AuthRequired;