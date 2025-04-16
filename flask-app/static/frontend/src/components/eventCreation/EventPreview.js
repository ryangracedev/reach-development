import React from 'react';
import { useEventContext } from '../../context/EventContext';
import CustomButton from '../common/CustomButton';
import './style/EventPreview.css';
import '../../animations/animations.scss';

const EventPreview = ({ nextStep, transitioning, transitionDirection, fadeIn }) => {
  const { eventData } = useEventContext();

  let animationClass = '';

  if (transitioning) {
    animationClass = transitionDirection === 'forward' ? 'slideLeft' : 'slideRight';
  } else if (fadeIn) {
    animationClass = 'fade-in';
  }

  const eventLink = `reachtheparty.com/${encodeURIComponent(eventData.name.toLowerCase())}`

  return (
    <div className={`event-link-preview ${animationClass}`}>

      {eventData.image && (
        <img className='event-image' src={URL.createObjectURL(eventData.image)} alt="Event" />
      )}

      <div className='link-preview-container'>
          <h1 className="auth-title">Copy this link and<br/>send it to your<br/>friends.</h1>
          <h3 className='event-link'>{eventLink}</h3>
      </div>

      <div className='nav-single'>
        <CustomButton className="next-btn" text="Done" onClick={nextStep} color="black" />
      </div>
      
    </div>
  );
};

export default EventPreview;