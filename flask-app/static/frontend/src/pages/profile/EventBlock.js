import React from 'react';
import './style/EventBlock.scss'; // Assumes styles for layout and text are here

const EventBlock = ({ title, date, time, imageUrl, isHosted }) => {
  return (
    <div className="event-block" style={{ backgroundImage: `url(${imageUrl})` }}>
      <div className="event-gradient-overlay"></div>
      <div className="event-block-top">
        <div className="event-hosted-wrapper">
          {isHosted && (
            <p className="event-hosted-label">HOST</p>
          )}
        </div>
        <div className="event-time-wrapper">
          <p className="event-time">{time}</p>
        </div>
      </div>
      <div className="event-block-bottom">
        <div className='event-block-meta'>
          <p className="event-date">{date}</p>
        </div>
        <h4 className="event-title">
          {title}
        </h4>
      </div>
    </div>
  );
};

export default EventBlock;