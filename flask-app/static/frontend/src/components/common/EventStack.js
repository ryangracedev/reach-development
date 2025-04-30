import React from 'react';
import './style/EventStack.scss';
import '../../animations/animations.scss';

const EventStack = ({ image, name, description, dateTime }) => {

  const formatEventDate = (isoString) => {
    const date = new Date(isoString);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date).toUpperCase();
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date).replace(' ', '').toUpperCase();
    return `${formattedDate}, ${formattedTime}`;
  };

  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <div className="event-preview">
      <img src={image || '/default-image.jpg'} alt="Event" className="event-preview-blur" />
      <img
        src={image || '/default-image.jpg'}
        alt="Event"
        className={`event-preview-image ${imageLoaded ? 'fade-in-delayed-1' : ''}`}
        onLoad={() => setImageLoaded(true)}
      />
      <div className="event-preview-info fade-in-no-transform">
        <p className="event-preview-date">{dateTime ? formatEventDate(dateTime) : 'Event Date'}</p>
        <h2 className="event-preview-title">{name || 'Event Title'}</h2>
        <p className="event-preview-description">"{description || 'Event description'}"</p>
      </div>
    </div>
  );
};

export default EventStack;