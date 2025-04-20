import React from 'react';
import { useEventContext } from '../../context/EventContext';
import CustomButton from '../common/CustomButton';
import EventStack from '../../components/common/EventStack';
import './style/EventPreview.css';
import '../../animations/animations.scss';

const EventPreview = ({ nextStep, transitioning, transitionDirection, fadeIn }) => {
  const { eventData } = useEventContext();

  let animationClass = '';

  if (transitioning) {
    animationClass = transitionDirection === 'forward' ? 'fade-out' : 'slideRight';
  } else if (fadeIn) {
    animationClass = 'fade-in';
  }

  const eventLink = `reachtheparty.com/${encodeURIComponent(eventData.name.toLowerCase())}`

  const imageUrl = eventData.image instanceof File
    ? URL.createObjectURL(eventData.image) // Convert File object to a URL
    : eventData.image || '/default-image.jpg'; // Use stored URL or fallback

  return (
    <div className={`event-link-preview ${animationClass}`}>

      {eventData.image && (
        // <img className='event-image' src={URL.createObjectURL(eventData.image)} alt="Event" />
        <div className='event-image'>
          <EventStack
            image={imageUrl}
            name={eventData.name}
            description={eventData.description}
            dateTime={eventData.dateTime}
          />
        </div>
      )}

      <div className='link-preview-container'>
          <h1 className="auth-title">Copy this link and<br/>send it to your<br/>friends.</h1>
          <div className='event-link-container'>
            <h3 className='event-link'>{eventLink}</h3>
          </div>
      </div>

      <div className='nav-single'>
        <CustomButton className="next-btn" text="Done" onClick={nextStep} color="black" />
      </div>
      
    </div>
  );
};

export default EventPreview;