import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "./style/Profile.scss";

const Profile = () => {
  const { username } = useParams(); // Extract the username from the URL
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
            <h2 className='checker-text-sub' id='list-label'>HOST</h2>
            <ul className="event-list">
              {profileData.hosted_events.map((event) => (
                <li key={event.event_id}>
                  <button className="list-events checker-text-red" onClick={() => navigate(`/${event.slug}`)}>
                    {event.event_name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {profileData.events_going_to && profileData.events_going_to.length > 0 && (
          <div className='profile-future-events'>
            <h2 className='checker-text-sub' id='list-label'>GOING</h2>
            <ul className="event-list">
              {profileData.events_going_to.map((event) => (
                <li key={event.event_id}>
                  <button className="list-events checker-text-yellow" onClick={() => navigate(`/${event.slug}`)}>
                    {event.event_name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {profileData.past_events && profileData.past_events.length > 0 && (
          <div className='profile-past-events'>
            <h2 className="checker-text-sub" id='list-label'>PAST</h2>
            <ul className="event-list">
              {profileData.past_events.map(({ event, was_host }) => (
                <li key={event.event_id}>
                  <button
                    className={`list-events ${was_host ? "checker-text-red-host" : "checker-text-white-past"}`}
                    onClick={() => navigate(`/${event.slug}`)}
                  >
                    {event.event_name}
                  </button>
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