import React, { useEffect, useState, useRef } from 'react';
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
  const [pullAmount, setPullAmount] = useState(0);  // How far the user has pulled up
  const [isOpen, setIsOpen] = useState(false);      // Whether the list is fully open
  const startYRef = useRef(null); 

  const [scrollProgress, setScrollProgress] = useState(0);

  const navigate = useNavigate();

  // ANIMATION

  const smoothScrollTo = (targetPosition, duration = 1000) => {
    const startPosition = window.scrollY;
    const startTime = performance.now();
  
    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Clamp between 0-1
  
      // Use ease-in-out effect
      const easeInOut = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  
      const newPosition = startPosition + (targetPosition - startPosition) * easeInOut;
      window.scrollTo(0, newPosition);
  
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
  
    requestAnimationFrame(animateScroll);
  };

  // 3️⃣ Listen for scroll & compute a “progress” value (0 → 1)
  useEffect(() => {
    let lastScrollY = window.scrollY; // Store last position
    const handleScroll = () => {

      // Choose how many pixels of scroll you want to transition over
      const maxScroll = 200; 
      let y = window.scrollY;
      
      if (y < 0) y = 0;

      let progress = y / maxScroll; 
      if (progress > 2.795) progress = 2.795;  // clamp at 1
      
      setScrollProgress(progress);

      // Define a buffer zone (avoid snapping too early)
      const lowerThreshold = 400; // Instead of 240
      const upperThreshold = 100; // Instead of 265 Go to list

      // console.log("Scroll Position:", y); // ✅ Print scroll position to console


      if (y > upperThreshold && lastScrollY <= upperThreshold) {
        console.log("Snapping to bottom...");
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      } else if (y < lowerThreshold && lastScrollY >= lowerThreshold) {
        console.log("Snapping to top...");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      lastScrollY = y; // Update last position

    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 5️⃣ Calculate style transforms & opacity in real-time
  // Top section goes from opacity 1 → 0 as scrollProgress goes 0 → 1
  const topOpacity = 1 - scrollProgress;
  // Move top section upward slightly as user scrolls
  const topTransform = `translateY(${ -30 * scrollProgress }px)`;

  // Bottom (attendees) starts off-screen & fades in
  const bottomOpacity = scrollProgress;

  const baseMargin = 64; // 1rem in pixels (adjust if needed)

  let scaleTopDown = 1 - ((scrollProgress / 2.795) * 0.2);  // Scale from 1 → 0.8
  let moveTopUp = 1 - ((scrollProgress / 2.795) * 0.2);  // Move up as it scales down
  
  let scaleBottomUp = 0.4 + ((scrollProgress / 2.795) * 0.6);  // Scale from 0.4 → 1
  let moveBottomUp = 0.8 + ((scrollProgress / 2.795) * 0.2);  // Move up as it scales up

  console.log(`${scrollProgress}`);

  console.log(`calc : ${-baseMargin} + (${scrollProgress} * ${baseMargin}`);
  // Moves from (original position - 1rem) → original when scrolling up
  const marginRight = `${-baseMargin + ((scrollProgress / 2.795) * baseMargin)}px`; 


  console.log("marginRight: ", marginRight);
  const bottomTransform = `translateY(${100 - 100 * scrollProgress}%)`;








  const handleTouchStart = (e) => {
    // Store the initial Y coordinate
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (startYRef.current === null) return;

    const currentY = e.touches[0].clientY;
    let diff = startYRef.current - currentY; // Positive if user swipes up

    // If pulling down from the top, diff is negative
    // We'll clamp the value between -200 and 200:
    if (diff < -200) diff = -200;
    if (diff > 200) diff = 200;

    setPullAmount(diff);
  };

  const handleTouchEnd = () => {
    // Decide threshold: if user pulled > 120px, open fully; otherwise snap back
    if (pullAmount > 60) {
      console.log("BIG SCROLL")
      setIsOpen(true);
    } else {
      console.log("close...")
      setIsOpen(false);
    }
    setPullAmount(0);
    startYRef.current = null;
  };

  // 0 = no pull, 200 = max pull
  const progress = pullAmount / 100;  
  // “List” label opacity goes from 0% to 100% as user pulls
  const listOpacity = isOpen ? 1 : progress; 
  // Event info fades out as user pulls up
  const infoOpacity = isOpen ? 0 : 1 - progress;

  // The REST

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
    <div className="event-page"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className='logo-container-event-page'>
        <img src="/Logo-Inflated2.png" alt="Reach Logo" className="logo-event-page" onClick={() => navigate('/')}/>
      </div>

      {eventData.image && (
        <img className='event-image-background' src={eventData.image} alt="Event" />
      )}

      {/* Main Event Info (Hides on Scroll Down) */}
      {/* Main container that handles touch events */}
      <div className="event-info-container" >

        {/* Event info: fade out as user pulls up */}
        <div
          className="top-section"
          style={{
            opacity: topOpacity,
            transform: topTransform,
            transform: `translateY(${100 - 100 * moveTopUp}%) scale(${scaleTopDown})`,
          }}
        >

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
                <svg xmlns="http://www.w3.org/2000/svg" width="21.304" height="17.296" viewBox="0 0 21.304 17.296">
                  <g id="Group_11" data-name="Group 11" transform="translate(1.505 2)">
                    <rect id="Rectangle_14" data-name="Rectangle 14" width="17.226" height="5" rx="2.5" transform="translate(4.082 10.181) rotate(-45)" fill="#fff"/>
                    <rect id="Rectangle_15" data-name="Rectangle 15" width="10.91" height="5" rx="2.5" transform="translate(2.03 4.047) rotate(45)" fill="#fff"/>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="19.023" height="19.165" viewBox="0 0 19.023 19.165">
              <g id="Group_31" data-name="Group 31" transform="translate(232.005 683.461) rotate(180)">
                <rect id="Rectangle_37" data-name="Rectangle 37" width="3.579" height="19.023" rx="1.79" transform="translate(232.005 672.089) rotate(90)" fill="#fff"/>
                <rect id="Rectangle_38" data-name="Rectangle 38" width="3.581" height="12.5" rx="1.791" transform="translate(224.353 680.928) rotate(135)" fill="#fff"/>
                <rect id="Rectangle_62" data-name="Rectangle 62" width="3.581" height="12.502" rx="1.791" transform="translate(221.822 664.296) rotate(45)" fill="#fff"/>
              </g>
            </svg>
          </div>

        </div>


        <div className="pull-up-handle" style={{ opacity: listOpacity }}>

        </div>

        {/* Attendees list: if isOpen is true, show fully; otherwise partially hidden */}
        <div
          className="attendees-list-container"
          style={{
            opacity: bottomOpacity,
            transform: bottomTransform,
            transform: `translateY(scale(${scaleBottomUp})`,
            marginRight: marginRight, // Apply dynamic margin change
          }}
        >
          <h2 className='list-name'>List</h2>
          <ul className="list">
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
    </div>
  );
};

export default EventPage;
