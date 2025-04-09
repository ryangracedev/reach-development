import React, { useEffect, useRef, useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { useNavigate } from 'react-router-dom'; // For navigation
import { useAuthAPI } from '../../hooks/useAuthAPI'; // Import the custom hook

const EventCreated = () => {
  const { eventData } = useEventContext();
  const { fetchWithAuth } = useAuthAPI(); // Use the fetchWithAuth hook
  const navigate = useNavigate(); // Hook for navigation
  const [error, setError] = useState('');
  const hasSubmitted = useRef(false);

  useEffect(() => {
    
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    const handleSubmit = async () => {
      console.log("Submitting Event Data: ", eventData);

      const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

      if (!token) {
        console.error('No token found. Please sign in or sign up.');
        navigate('/signup'); // Redirect to signup if no token
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

        const response = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/api/create-event`, {
          method: 'POST',
          body: formData, // Send form data
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

    handleSubmit(); // Call handleSubmit when component mounts
  }, [eventData, fetchWithAuth, navigate]); // Dependencies for useEffect

  return null; // No UI needed
};

export default EventCreated;