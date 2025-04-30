import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "./style/Profile.scss";
import EventBlock from './EventBlock';

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

  console.log('Hosted:', profileData.hosted_events);
  console.log('Going:', profileData.events_going_to);
  console.log('Past:', profileData.past_events);

  return (
    <div className="profile-container">
      <div className="top-gradient-overlay"></div>
      <div className="profile-header">
          <img src="/Reach_Logo_Full.png" alt="Reach Logo" className="logo-profile" />
          <h1 className="profile-username">@{profileData.username}</h1>
      </div>

      <div className='events-section'>

        {([...profileData.hosted_events, ...profileData.events_going_to].some(event => new Date(event.date_time).getTime() > Date.now())) && (
          <>
            <h2 id='list-label'>Future</h2>
            <div className='event-grid future-scroll'>
              {[...profileData.hosted_events, ...profileData.events_going_to]
                .filter(event => new Date(event.date_time).getTime() > Date.now())
                .map((event, index) => (
                  <div
                    className="fade-in"
                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                    key={event.event_id}
                    onClick={() => navigate(`/${event.slug}`)}
                  >
                    <EventBlock
                      title={event.event_name}
                      date={new Date(event.date_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      time={event.date_time ? new Date(event.date_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                      imageUrl={event.image_url}
                      isHosted={profileData.hosted_events.some(hosted => hosted.event_id === event.event_id)}
                    />
                  </div>
                ))}
            </div>
          </>
        )}

        {profileData.past_events.some(({ event }) => new Date(event.date_time).getTime() + 12 * 60 * 60 * 1000 < Date.now()) && (
          <>
            <h2 id='list-label'>Past</h2>
            <div className='event-grid'>
              {profileData.past_events
                .filter(({ event }) => new Date(event.date_time).getTime() + 12 * 60 * 60 * 1000 < Date.now())
                .map(({ event, was_host }, index) => (
                  <div
                    className="fade-in"
                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                    key={event.event_id}
                    onClick={() => navigate(`/${event.slug}`)}
                  >
                    <EventBlock
                      title={event.event_name}
                      date={new Date(event.date_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      imageUrl={event.image_url}
                      isHosted={was_host}
                    />
                  </div>
                ))}
            </div>
          </>
        )}

      </div>


    </div>
  );
};

export default Profile;



// <button id='event-button' className="list-events checker-text-red" onClick={() => navigate(`/${event.slug}`)}>
//   {event.event_name}
// </button>
// <button id='event-button' className="list-events checker-text-yellow" onClick={() => navigate(`/${event.slug}`)}>
//   {event.event_name}
// </button>
// <button
//   id='event-button'
//   className={`list-events ${was_host ? "checker-text-red-host" : "checker-text-white-past"}`}
//   onClick={() => navigate(`/${event.slug}`)}
// >
//   {event.event_name}  
// </button>