import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import AuthContext
import './style/EventPage.css'


const EventPage = () => {
  const { eventName } = useParams(); // Get event name from URL
  const { authState } = useAuth(); // Get current user state
  const [eventData, setEventData] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [error, setError] = useState('');
  const [isGoing, setIsGoing] = useState(false); // Track if user is attending
  const [countdown, setCountdown] = useState('');
  const [isAddressReleased, setIsAddressReleased] = useState(false); // ✅ Track if address is released
  const [showAttendees, setShowAttendees] = useState(false); // ✅ Track whether to show attendees list

  const navigate = useNavigate();

  console.log("On event page!")

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${encodeURIComponent(eventName)}`);
        if (response.ok) {
          const data = await response.json();

          console.log("Fetched Event Data!")
          setEventData(data);


          console.log(`Auth: ${authState.isAuthenticated}`)
          console.log(`Auth.Username: ${authState.username}`)
          console.log(`Host_ID: ${data.host_id}`); // ✅ Uses `data` directly

          // Check if the logged-in user is already attending
          if (authState.isAuthenticated && data.attendees?.includes(authState.username)) {
            setIsGoing(true);
          }

        } else {
          const errorResponse = await response.json();
          console.log("Event Data not fetched!")
          setError(errorResponse.error || 'Failed to load event data.');
        }

      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('An error occurred. Please try again.');
      }
    };

    fetchEventData();
  }, [eventName, authState]);

  useEffect(() => {
    if (!eventData?.date_time) return;
  
    const eventDate = new Date(eventData.date_time);
    const releaseTime = new Date(eventDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before event start
  
    const updateCountdown = () => {
      const now = new Date();
      const timeLeft = releaseTime - now;
  
      if (timeLeft <= 0) {
        setCountdown(eventData.address); // ✅ Replace timer with address
        setIsAddressReleased(true); // ✅ Update state to show "Address:"
        return;
      }
  
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000).toString().padStart(2, '0');
  
      if (days > 0) {
        setCountdown(`${days}D : ${hours}H : ${minutes}M : ${seconds}S`);
      } else {
        setCountdown(`${hours}H : ${minutes}M : ${seconds}S`);
      }
    };
  
    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000);
  
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [eventData]);



  // ✅ Fetch Attendees List
  useEffect(() => {
    if (!eventData) return;

    const fetchAttendees = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${encodeURIComponent(eventName)}/attendees`);
        if (response.ok) {
          const data = await response.json();
          setAttendees(data.attendees);
        }
      } catch (err) {
        console.error('Error fetching attendees:', err);
      }
    };

    fetchAttendees();
  }, [eventData]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
  
      // Show attendees if user scrolls down past 40px
      if (y > 80 && !showAttendees) {
        setShowAttendees(true);
      }
      // Hide attendees if user scrolls up above 40px
      else if (y < 80 && showAttendees) {
        setShowAttendees(false);
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAttendees]);



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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventName}/attend`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventName}/unattend`, {
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



  // Extract and format date & time separately
  const eventDate = eventData?.date_time
    ? new Date(eventData.date_time).toLocaleDateString('en-US', {
        month: 'short', // "OCT"
        day: '2-digit'  // "18"
      })
    : '';

  const eventTime = eventData?.date_time
    ? new Date(eventData.date_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true // Ensures AM/PM format
      })
    : '';

  const eventLink = `reachtheparty.com/${encodeURIComponent(eventName)}`;

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!eventData) {
    return <p>Loading...</p>;
  }

  const isHost = authState.isAuthenticated && eventData && authState.userId === eventData.host_id;

  return (
    <div className="event-page">
      <div className='logo-container-event-page'>
        <img
          src="/Logo-Inflated2.png"
          alt="Reach Logo"
          className="logo-event-page"
          onClick={() => navigate('/')}
        />
      </div>

      {eventData.image && (
        <img
          className='event-image-background'
          src={eventData.image}
          alt="Event"
        />
      )}

      {/* Main Event Info (Hides on Scroll Down) */}
      <div className={`event-info-container ${showAttendees ? 'hidden' : ''}`}>
        <div className='event-meta'>
          <h1 className='event-page-date'>
            {eventDate} <span style={{ marginLeft: '10px' }}>{eventTime}</span>
          </h1>
          <h1 className='event-page-name'>{eventData.event_name}</h1>
          <h1 className='event-page-hostname'>@{eventData.host_username}</h1>
          <h1 className='event-page-desc'>{eventData.description}</h1>
        </div>

        <div className='accept-event-container'>
          {isHost ? (
            <p>Your Party</p>
          ) : (
            <button
              className={`yes-button ${isGoing ? 'going' : ''}`}
              disabled={isGoing}
              onClick={handleYes}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21.304"
                height="17.296"
                viewBox="0 0 21.304 17.296"
              >
                <g id="Group_11" data-name="Group 11" transform="translate(1.505 2)">
                  <rect
                    id="Rectangle_14"
                    data-name="Rectangle 14"
                    width="17.226"
                    height="5"
                    rx="2.5"
                    transform="translate(4.082 10.181) rotate(-45)"
                    fill="#fff"
                  />
                  <rect
                    id="Rectangle_15"
                    data-name="Rectangle 15"
                    width="10.91"
                    height="5"
                    rx="2.5"
                    transform="translate(2.03 4.047) rotate(45)"
                    fill="#fff"
                  />
                </g>
              </svg>
            </button>
          )}

          <div className="countdown-container">
            <p>{isAddressReleased ? "Address:" : "ADDRESS IS RELEASED IN"}</p>
            <h1 className="countdown-timer">{countdown}</h1>
          </div>
        </div>

        <div className='event-link-button'>
          <h1 className='link'>{eventLink}</h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19.023"
            height="19.165"
            viewBox="0 0 19.023 19.165"
          >
            <g
              id="Group_31"
              data-name="Group 31"
              transform="translate(232.005 683.461) rotate(180)"
            >
              <rect
                id="Rectangle_37"
                data-name="Rectangle 37"
                width="3.579"
                height="19.023"
                rx="1.79"
                transform="translate(232.005 672.089) rotate(90)"
                fill="#fff"
              />
              <rect
                id="Rectangle_38"
                data-name="Rectangle 38"
                width="3.581"
                height="12.5"
                rx="1.791"
                transform="translate(224.353 680.928) rotate(135)"
                fill="#fff"
              />
              <rect
                id="Rectangle_62"
                data-name="Rectangle 62"
                width="3.581"
                height="12.502"
                rx="1.791"
                transform="translate(221.822 664.296) rotate(45)"
                fill="#fff"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Attendees List (Slides Up on Scroll Down) */}
      <div className={`attendees-container ${showAttendees ? 'visible' : ''}`}>
        <h2>Attendees</h2>
        <ul className="attendees-list">
          {attendees.length > 0 ? (
            attendees.map((attendee, index) => (
              <li key={index} className="attendee">
                @{attendee}
              </li>
            ))
          ) : (
            <p>No attendees yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EventPage;
