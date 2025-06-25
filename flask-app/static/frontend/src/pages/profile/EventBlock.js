import React from 'react';
import './style/EventBlock.scss'; // Assumes styles for layout and text are here

const EventBlock = ({ title, date, time, imageUrl, isHosted, isGoing, isFuture, isOwnProfile }) => {
  return (
    <div className={isHosted ? 'event-block-border-wrapper' : ''}>
      <div className="event-block" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="event-gradient-overlay"></div>
        <div className="event-block-bottom">
          <div className="event-hosted-wrapper">
            {(isHosted || isGoing) && (
              <p className={`event-hosted-label ${!isHosted ? 'event-attended-label' : ''}`}>
                {isHosted ? (isOwnProfile ? "Your Party" : (isFuture ? "Host" : "Host")) : (isFuture ? "" : "")}
              </p>
            )}
          </div>
          <h4 className={`event-title ${!isFuture ? 'past-event' : ''}`}>
            {title}
          </h4>
        </div>
        <div className='event-block-meta'>
          <p className="event-date">{date}</p>
        </div>
      </div>
    </div>
  );
};

export default EventBlock;