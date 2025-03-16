import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./style/Profile.css";

const Profile = () => {
  const { username } = useParams(); // Extract the username from the URL
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/${username}`, {
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
    <div className="profile-container">

      <h1 className="profile-username">@{profileData.username}</h1>

      {/* Hosted Events */}
      <h2>Hosted Events</h2>
      <ul className="event-list">
        {profileData.hosted_events.map((event) => (
          <li key={event.event_id}>
            <a href={`/${event.event_name}`} className="event-link">
              {event.event_name}
            </a>
          </li>
        ))}
      </ul>

      {/* Events Going To */}
      <h2>Attending Events</h2>
      <ul className="event-list">
        {profileData.events_going_to.map((event) => (
          <li key={event.event_id}>
            <a href={`/${event.event_name}`} className="event-link">
              {event.event_name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;