import React from 'react';
import { useEventContext } from '../../context/EventContext';
import '../../pages/create-event/style/EventCreation.css';
import '../../pages/create-event/style/EventCreation.css';
import CustomButton from '../common/CustomButton';

const EventStepThree = ({ nextStep }) => {
  const { eventData } = useEventContext();

  const eventLink = `http://localhost:3000/event/${encodeURIComponent(eventData.name)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(eventLink);
    alert('Event link copied to clipboard!');
  };

  return (
    <div className="event-step">
      <h2>Share Your Event</h2>
      <p>Your event link:</p>
      <div className="event-link-container">
        <input type="text" value={eventLink} readOnly />
        <button onClick={handleCopy}>Copy</button>
      </div>
      <button onClick={nextStep}>Done</button>
    </div>
  );
};

export default EventStepThree;
