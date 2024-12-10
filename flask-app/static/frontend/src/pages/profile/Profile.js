import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { username } = useParams(); // Extract the username from the URL
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/profile/${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch profile.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('An error occurred. Please try again.');
      }
    };

    fetchProfile();
  }, [username]);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!profileData) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
      <h1>{profileData.username}'s Profile</h1>
      <h2>Events Hosting</h2>
      <ul>
        {profileData.hosted_events.map((event) => (
          <li key={event.event_id}>
            <h4>{event.event_name}</h4>
            <p>{event.description}</p>
            <p>{new Date(event.date_time).toLocaleString()}</p>
            <p>{event.address}</p>
          </li>
        ))}
      </ul>

      <h2>Events Going To</h2>
      <ul>
        {profileData.events_going_to.map((event) => (
          <li key={event.event_id}>
            <h4>{event.event_name}</h4>
            <p>{event.description}</p>
            <p>{new Date(event.date_time).toLocaleString()}</p>
            <p>{event.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;