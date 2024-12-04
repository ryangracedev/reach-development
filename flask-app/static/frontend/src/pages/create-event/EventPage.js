import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


const EventPage = () => {
  const { eventName } = useParams(); // Extract the dynamic event name from the URL
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${encodeURIComponent(eventName)}`);
        if (response.ok) {
          const data = await response.json();
          setEventData(data);
        } else {
          const errorResponse = await response.json();
          setError(errorResponse.error || 'Failed to load event data.');
        }
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('An error occurred. Please try again.');
      }
    };

    fetchEventData();
  }, [eventName]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!eventData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="event-page">
      <h1>{eventData.event_name}</h1>
      <p><strong>Description:</strong> {eventData.description}</p>
      <p><strong>Address:</strong> {eventData.address}</p>
      <p><strong>Date/Time:</strong> {new Date(eventData.date_time).toLocaleString()}</p>
      {eventData.image && <img src={eventData.image} alt="Event" />}
    </div>
  );
};

export default EventPage;
