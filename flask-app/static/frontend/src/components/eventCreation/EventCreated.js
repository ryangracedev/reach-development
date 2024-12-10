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

    console.log("Event Data: ", eventData)

    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

    if (!token) {
      console.error('No token found. Please sign in or sign up.');
      return;
    }

    setError('');
    try {

      const formData = new FormData();
      formData.append('image', eventData.image);
      formData.append('event_name', eventData.name);
      formData.append('description', eventData.description);
      formData.append('address', eventData.address);
      formData.append('date_time', eventData.dateTime);

      const response = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/create-event`, {
        method: 'POST',
        body: formData, // Directly send the form data
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Event created:', result);

        // Redirect to the dynamic event page
        navigate(`/${encodeURIComponent(eventData.name.toLowerCase())}`);
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