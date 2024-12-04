import React from 'react';
import { useEventContext } from '../../context/EventContext';
import './style/EventPreview.css';


const EventPreview = ({ nextStep }) => {
  const { eventData } = useEventContext();

  return (
    <div className="event-preview">
      <h2>Preview Your Event</h2>
      {eventData.image && <img src={URL.createObjectURL(eventData.image)} alt="Event" />}
      <p><strong>Title:</strong> {eventData.name}</p>
      <p><strong>Description:</strong> {eventData.description}</p>
      <p><strong>Address:</strong> {eventData.address}</p>
      <p><strong>Date:</strong> {new Date(eventData.dateTime).toLocaleString()}</p>
      <button onClick={nextStep}>All Set</button>
    </div>
  );
};

export default EventPreview;