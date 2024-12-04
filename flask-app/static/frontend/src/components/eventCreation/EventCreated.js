import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { useNavigate } from 'react-router-dom'; // For navigation

const EventCreated = () => {
  const { eventData } = useEventContext();
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async () => {
    setError('');
    try {
      // Retrieve the JWT token from localStorage
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setError('User is not authenticated. Please sign in.');
        return;
      }

      console.log("Local Storage: \n", localStorage);
      console.log("Token: \n", token);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
        },
        body: JSON.stringify({
          event_name: eventData.name,
          description: eventData.description,
          address: eventData.address,
          date_time: eventData.dateTime,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Event created:', result);

        // Redirect to the dynamic event page
        navigate(`/${encodeURIComponent(eventData.name)}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create the event');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="event-step">
      <h2>Submitting Your Event...</h2>
      {error && <p className="error">{error}</p>}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default EventCreated;