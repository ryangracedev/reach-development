import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { useNavigate } from 'react-router-dom'; // For navigation
import { useAuthAPI } from '../../hooks/useAuthAPI'; // Import the custom hook

const EventCreated = () => {
  const { eventData } = useEventContext();
  const { fetchWithAuth } = useAuthAPI(); // Use the fetchWithAuth hook
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async () => {
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

    if (!token) {
      console.error('No token found. Please sign in or sign up.');
      return;
    }

    

    setError('');
    try {
      const response = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/create-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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