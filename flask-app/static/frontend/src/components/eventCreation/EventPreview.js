import React from 'react';
import { useEventContext } from '../../context/EventContext';
import CustomButton from '../common/CustomButton';
import './style/EventPreview.css';


const EventPreview = ({ nextStep }) => {
  const { eventData } = useEventContext();

  const eventLink = `reachtheparty.com/${encodeURIComponent(eventData.name.toLowerCase())}`

  return (
    <div className="event-link-preview">

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