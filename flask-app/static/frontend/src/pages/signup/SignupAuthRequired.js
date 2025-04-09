import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EventStack from '../../components/common/EventStack';
import CustomButton from '../../components/common/CustomButton';
import './style/SignupAuthRequired.css'

const EventSignupIntro = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { returnTo, action, image, eventName, description, dateTime } = location.state || {};

    
  const [fadeState, setFadeState] = React.useState('fade-in');

  const handleNext = () => {
    setFadeState('fade-out');
    setTimeout(() => {
      navigate('/signup-for-event', {
        state: { returnTo, action, image, eventName, description, dateTime }
      });
    }, 300);
  };

  const imageUrl = image instanceof File
    ? URL.createObjectURL(image) // Convert File object to a URL
    : image || '/default-image.jpg'; // Use stored URL or fallback

  return (
    <div className={`auth-required ${fadeState}`}>
        <div className='create-an-account'>
            <div className='page-headings' id='page-headings'>
                <h1 className="auth-title">To accept a party,<br/>you have to create<br/>an account.</h1>
                <p className="auth-subtext" id='auth-subtext'>It also lets you create<br/>other events.</p>
            </div>
            {/* Event Stack Component */}
            <EventStack
                image={imageUrl}
                name={eventName}
                description={description}
                dateTime={dateTime}
            />
        </div>
        <CustomButton className="next-btn" text="OK" onClick={handleNext} />
    </div>
  );
};

export default EventSignupIntro;