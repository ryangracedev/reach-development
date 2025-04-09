import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./style/Profile.scss";

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
          console.log(data)
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
      <div className="profile-header">
          <img src="/Reach_Logo_Full.png" alt="Reach Logo" className="logo-profile" />
          <h1 className="profile-username">@{profileData.username}</h1>
      </div>

      <div className='events-section'>

        {profileData.hosted_events && profileData.hosted_events.length > 0 && (
          <div className='profile-hosted-events'>
            <h2 className='checker-text-red'>Hosted Events</h2>
            <ul className="event-list">
              {profileData.hosted_events.map((event) => (
                <li key={event.event_id}>
                  <a href={`/${event.event_name}`} className="list-events checker-text-red">
                    {event.event_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {profileData.events_going_to && profileData.events_going_to.length > 0 && (
          <div className='profile-future-events'>
            <h2 className='checker-text-yellow'>Attending Events</h2>
            <ul className="event-list">
              {profileData.events_going_to.map((event) => (
                <li key={event.event_id}>
                  <a href={`/${event.event_name}`} className="list-events checker-text-yellow">
                    {event.event_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {profileData.past_events && profileData.past_events.length > 0 && (
          <div className='profile-past-events'>
            <h2 className="checker-text-white">Past Events</h2>
            <ul className="event-list">
              {profileData.past_events.map(({ event, was_host }) => (
                <li key={event.event_id}>
                  <a
                    href={`/${event.event_name}`}
                    className={`list-events ${was_host ? "checker-text-red" : "checker-text-white"}`}
                  >
                    {event.event_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>


    </div>
  );
};

export default Profile;