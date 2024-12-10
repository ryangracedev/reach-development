import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import AuthContext


const EventPage = () => {
  const { eventName } = useParams(); // Get event name from URL
  const { authState } = useAuth(); // Get current user state
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState('');
  const [isGoing, setIsGoing] = useState(false); // Track if user is attending
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${encodeURIComponent(eventName)}`);
        if (response.ok) {
          const data = await response.json();
          setEventData(data);

          // Check if the logged-in user is already attending
          if (authState.isAuthenticated && data.attendees?.includes(authState.username)) {
            setIsGoing(true);
          }

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
  }, [eventName, authState]);










  const handleYes = () => {
    if (!authState.isAuthenticated) {
      // Redirect to signup with the current event name
      navigate('/signup-for-event', { state: { returnTo: `/${eventName}`, action: 'yes' } });
    } else {
      // Call the /attend endpoint if the user is signed in
      attendEvent();
    }
  };

  const handleNo = () => {
    if (!authState.isAuthenticated) {
      // Redirect to signup with the current event name
      navigate('/signup-for-event', { state: { returnTo: `/${eventName}`, action: 'no' } });
    } else {
      // Call the /unattend endpoint if the user is signed in
      unattendEvent();
    }
  };

  const attendEvent = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${eventName}/attend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ username: authState.username }),   // Can remove later, no need to send due to get_jwt_identity() in the backend
      });

      if (response.ok) {
        setIsGoing(true);
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'Failed to mark attendance.');
      }
    } catch (err) {
      console.error('Error attending event:', err);
      setError('An error occurred. Please try again.');
    }
  };

  const unattendEvent = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${eventName}/unattend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ username: authState.username }),   // Can remove later, no need to send due to get_jwt_identity() in the backend
      });

      if (response.ok) {
        setIsGoing(false);
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || 'Failed to remove attendance.');
      }
    } catch (err) {
      console.error('Error removing attendance:', err);
      setError('An error occurred. Please try again.');
    }
  };










  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!eventData) {
    return <p>Loading...</p>;
  }

  const isHost = authState.isAuthenticated && authState.userId === eventData.host_id;

  return (
    <div className="event-page">
      {eventData.image && <img src={eventData.image} alt="Event" />}
      <h1>{eventData.event_name}</h1>
      <p><strong>Description:</strong> {eventData.description}</p>
      <p><strong>Address:</strong> {eventData.address}</p>
      <p><strong>Date/Time:</strong> {new Date(eventData.date_time).toLocaleString()}</p>
      <p><strong>Auth: </strong>{authState.isAuthenticated}</p>
      <p><strong>Auth.Username: </strong>{authState.username}</p>
      <p><strong>Host_ID: </strong>{eventData.host_id}</p>
      {isHost ? (
        <p>Your Party</p>
      ) : (
        <div>
          <button disabled={isGoing} onClick={handleYes}>
            {isGoing ? 'Going' : 'Yes'}
          </button>
          <button onClick={handleNo}>No</button>
        </div>
      )}
    </div>
  );
};

export default EventPage;
