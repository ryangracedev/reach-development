import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import AuthContext
import CustomInput from '../../components/common/CustomInput';
import './style/EventPage.scss'
import '../../animations/animations.scss'

const EventPage = () => {
  const { slug } = useParams();
  const { authState } = useAuth(); // Get current user state
  const [eventData, setEventData] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [error, setError] = useState('');
  const [isGoing, setIsGoing] = useState(false); // Track if user is attending
  const [countdown, setCountdown] = useState('');
  const [isAddressReleased, setIsAddressReleased] = useState(false); // ✅ Track if address is released
  const [showAttendees, setShowAttendees] = useState(false); // ✅ Track whether to show attendees list
  const [activeOverlay, setActiveOverlay] = useState(null); // null | 'list' | 'edit'
  const [originalEventData, setOriginalEventData] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isFirstLoad = useRef(true);
  const [hasEventEnded, setHasEventEnded] = useState(false);
  const firstAnimationClass = useRef({
    meta: isFirstLoad.current ? 'fade-in-delayed-1' : 'fade-in-no-delay',
    accept: isFirstLoad.current ? 'fade-in-delayed-2' : 'fade-in-no-delay',
    link: isFirstLoad.current ? 'fade-in-delayed-3' : 'fade-in-no-delay',
  });
  isFirstLoad.current = false;

  const navigate = useNavigate();

  const handleToggleOverlay = (type) => {
    setActiveOverlay((prev) => (prev === type ? null : type));
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const mapLink = isIOS
    ? `http://maps.apple.com/?q=${encodeURIComponent(countdown)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(countdown)}`;

  useEffect(() => {
    isFirstLoad.current = false;
    console.log("Set MOUNTing True: ", isFirstLoad.current)
  }, []);

  useEffect(() => {
    if (activeOverlay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeOverlay]);

  // The REST

  useEffect(() => {
    // For Safari bfcache fix
    window.history.scrollRestoration = 'manual';

    window.scrollTo({ top: 0, behavior: 'auto' });
  
    const unload = () => {
      // Prevent page from being cached in bfcache
      window.location.href = window.location.href;
    };
  
    window.addEventListener('unload', unload);
  
    return () => {
      window.removeEventListener('unload', unload);
    };
  }, []);


  useEffect(() => {
    if (eventData && !originalEventData) {
      setOriginalEventData(JSON.parse(JSON.stringify(eventData))); // deep copy once
    }
  }, [eventData]);

  useEffect(() => {
    const fetchEventData = async () => {
      let isMounted = true;

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${slug}`);
        if (response.ok) {
          const data = await response.json();

          console.log("Fetched Event Data!")
          setEventData(data);
          setAttendees(data.attendees || []);

          console.log(`Auth: ${authState.isAuthenticated}`)
          console.log(`Auth.Username: ${authState.username}`)
          console.log(`Host_ID: ${data.host_id}`); // ✅ Uses `data` directly

          // Check if the logged-in user is already attending
          if (
            isMounted &&
            authState &&
            authState.isAuthenticated &&
            data.attendees?.includes(authState.username)
          ) {
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

      return () => {
        isMounted = false;
      };
    };

    fetchEventData();
  }, [slug, authState]);

  useEffect(() => {
    if (!eventData?.date_time) return;
  
    const eventDate = new Date(eventData.date_time);
    const releaseTime = new Date(eventDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before event start
    const eventEndTime = new Date(eventDate.getTime() + 12 * 60 * 60 * 1000); // 12 hours after start
  
    const updateCountdown = () => {
      const now = new Date();

      if (now >= eventEndTime) {
        setHasEventEnded(true);
      } else {
        setHasEventEnded(false);
      }

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


  // Delete event handler
  const handleDeleteEvent = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/delete-event/${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      if (response.ok) {
        navigate('/');
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete event.");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleYes = () => {
    if (!authState.isAuthenticated) {
      // Redirect to signup with the current event name
      navigate('/signup-auth-required', { 
        state: { 
          returnTo: `/${slug}`,
          action: 'yes',
          image: eventData.image,
          eventName: eventData.event_name,
          description: eventData.description,
          dateTime: eventData.date_time
        } 
      });
    } else {
      // Call the /attend endpoint if the user is signed in
      attendEvent();
    }
  };

  const handleNo = () => {
    if (!authState.isAuthenticated) {
      // Redirect to signup with the current event name
      navigate('/signup-for-event', { state: { returnTo: `/${slug}`, action: 'no' } });
    } else {
      // Call the /unattend endpoint if the user is signed in
      unattendEvent();
    }
  };

  const attendEvent = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${slug}/attend`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${slug}/unattend`, {
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

  const handleSaveEvent = async () => {
    const formData = new FormData();
    formData.append("event_name", eventData.event_name);
    formData.append("description", eventData.description);
    formData.append("address", eventData.address);
    formData.append("date_time", eventData.date_time);
  
    // Only append if user uploaded a new image (check if it's a File object)
    if (eventData.image instanceof File) {
      formData.append("image", eventData.image);
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/update-event/${slug}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Event updated:", data);
        setActiveOverlay(null);
        // window.location.reload();  // Force refresh to reflect changes
      } else {
        const error = await response.json();
        console.error("Update error:", error.error);
      }
    } catch (err) {
      console.error("Error submitting update:", err);
    }
  };

  const handleUpdateEventImage = async (newImageFile) => {
    const formData = new FormData();
    formData.append('image', newImageFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/update-event-image/${slug}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Image updated successfully:', data);
        setEventData((prev) => ({
          ...prev,
          image: data.image_url,
          imagePreview: data.image_url
        }));
      } else {
        const error = await response.json();
        console.error('Image update error:', error.error);
      }
    } catch (err) {
      console.error('Error updating image:', err);
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

  const eventLink = `reachtheparty.com/${slug}`;

  const handleShare = () => {
    const shareData = {
      title: eventData.event_name,
      text: `Check out this event: ${eventData.event_name}`,
      url: `https://${eventLink}`, // You might need to prefix with https://
    };
  
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('Shared successfully'))
        .catch((err) => console.error('Error sharing:', err));
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareData.url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Could not copy link. Please copy manually.'));
    } else {
      // Absolute last-resort fallback
      prompt('Copy party link:', shareData.url);
    }
  };

  if (error) {
    return (
      <div className="event-page__error-container">
        <p 
          className="event-page__error fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          This party<br/> doesn't exist.
        </p>
        <div className="event-page__error-logo">
          <img
            src="/Reach_Logo_Full.png"
            alt="Reach Logo"
            className="logo-event-page fade-in"
            style={{ animationDelay: '0.2s' }}
            onClick={() => navigate('/')}
          />
          <p 
            className="event-page__home-text fade-in"
            style={{ animationDelay: '0.1s' }}
          >
           Back to home.
          </p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return <p>Loading...</p>;
  }

  const isHost = authState.isAuthenticated && eventData && authState.userId === eventData.host_id;

  return (
    <div className="event-page">
      <div
        className={`user-tag-banner ${
          isHost ? 'host visible banner-fade-slide-in' : isGoing ? 'going visible' : ''
        }`}
        onClick={() => {
          if (isHost && hasEventEnded) {
            document.getElementById('change-photo-upload').click();
          }
        }}
        style={{ cursor: isHost && hasEventEnded ? 'pointer' : 'default' }}
      >
        {isHost
          ? hasEventEnded ? 'Change Photo' : 'YOUR PARTY'
          : isGoing
            ? hasEventEnded ? 'YOU WENT' : 'YOU\'RE GOING'
            : ''}
      </div>

      <input
        type="file"
        id="change-photo-upload"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            handleUpdateEventImage(file);
          }
        }}
      />

      {/* Background Image */}
      {eventData.image && (
        <div className="event-background-wrapper">
          <img
            className={`event-image-background ${imageLoaded ? 'fade-in-img' : ''}`}
            style={{ animationDelay: '0.1s' }}
            src={eventData.imagePreview || eventData.image}
            alt="Event"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      )}

      {/* Logo */}
      <div className='bottom-container'>
        {activeOverlay !== 'edit' && (
          <img
            src="/Reach_Logo_Full.png"
            alt="Reach Logo"
            className={`logo-event-page fade-in-delayed-3 ${activeOverlay === 'list' ? 'hide-logo' : ''}`}
            style={{ animationDelay: '0.3s' }}
            onClick={() => navigate('/')}
          />
        )}
        {activeOverlay === 'edit' ? (
          <>
            <button className='trash-button fade-in-delayed-3' style={{ animationDelay: '0.3s' }} onClick={handleDeleteEvent}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 49 50.709">
                <g transform="translate(-955 -194.645)">
                  <line x2="7" y2="45" transform="translate(960.5 197.5)" stroke="#fff" strokeLinecap="round" strokeWidth="5"/>
                  <line x1="24" transform="translate(967.5 242.5)" stroke="#fff" strokeLinecap="round" strokeWidth="5"/>
                  <line x2="44" transform="translate(957.5 197.5)" stroke="#fff" strokeLinecap="round" strokeWidth="5"/>
                  <line x1="7" y2="45" transform="translate(991.5 197.5)" stroke="#fff" strokeLinecap="round" strokeWidth="5"/>
                </g>
              </svg>
            </button>
            <div className="edit-buttons-group fade-in-delayed-3" style={{ animationDelay: '0.3s' }}>
              <button 
                type="button" 
                className='list-button' 
                onClick={() => {
                  setActiveOverlay(null)
                  setEventData(originalEventData); // Reset to original data
                }}
              >
                CANCEL
              </button>
              <button className='list-button' onClick={handleSaveEvent}>
                SAVE
              </button>
            </div>
          </>
        ) : (
          <button className='list-button fade-in-delayed-3' style={{ animationDelay: '0.7s' }} onClick={() => handleToggleOverlay('list')}>
            {activeOverlay === 'list' ? 'CLOSE' : 'LIST'}
          </button>
        )}
      </div>

      {/* Event Information */}
      <div className="event-info-container">

        <div 
          className={`event-meta ${
            (activeOverlay === 'list' || activeOverlay === 'edit') 
              ? 'fade-out-no-delay' 
              : firstAnimationClass.current.meta
          }`}
        >
          <div className={`meta-inner ${hasEventEnded ? 'event-ended-opacity' : ''}`}>
            <div className="meta-backdrop"></div>
            <h1 className='event-page-date'>
              <span style={{ marginRight: '6px' }}>{eventDate}</span>•<span style={{ marginLeft: '6px' }}>{eventTime}</span>

            </h1>
            <h1 className='event-page-name'>{eventData.event_name}</h1>
            <h1 className='event-page-desc'>"{eventData.description}"</h1>
            <div className='event-page-meta'>
              <div className='event-hostname-wrapper'>
                <h1
                  className='event-page-hostname clickable'
                  onClick={() => navigate(`/profile/${eventData.host_username}`)}
                >
                  @{eventData.host_username}
                </h1>
              </div>
            </div>
          </div>
        </div>
          
        <div 
          className={`accept-event-container`}
        >
          {hasEventEnded ? (
            <div className={`event-ended-message ${
              (activeOverlay === 'list' || activeOverlay === 'edit') 
                ? 'fade-out-no-delay' 
                : firstAnimationClass.current.accept
            }`}>
              <h2 className='event-ended-text'>
                This party has ended.
              </h2>
            </div>
          ) : (
            <>
              {isHost ? (
                <button 
                  className={`edit-button ${
                    (activeOverlay === 'list' || activeOverlay === 'edit') 
                      ? 'fade-out-no-delay' 
                      : firstAnimationClass.current.accept
                  }`}
                  onClick={() => handleToggleOverlay('edit')}
                >
                  {activeOverlay === 'edit' ? 'EDIT' : 'EDIT'}
                </button>
              ) : (
                <button 
                  className={`yes-button ${isGoing ? 'going' : ''} ${
                    (activeOverlay === 'list' || activeOverlay === 'edit') 
                      ? 'fade-out-no-delay' 
                      : firstAnimationClass.current.accept
                  }`}
                  onClick={isGoing ? handleNo : handleYes}
                >
                  {isGoing ? (
                    <svg
                      key="x-icon"
                      className="fade-in"
                      xmlns="http://www.w3.org/2000/svg"
                      width="15.717"
                      height="15.717"
                      viewBox="0 0 15.717 15.717"
                    >
                      <g transform="translate(-4.082 2)">
                        <rect width="17.226" height="5" rx="2.5" transform="translate(4.082 10.181) rotate(-45)" fill="#fff" />
                        <rect width="17.226" height="5" rx="2.5" transform="translate(16.264 13.716) rotate(-135)" fill="#fff" />
                      </g>
                    </svg>
                  ) : (
                    <svg
                      key="check-icon"
                      className="checkmark-icon fade-in"
                      viewBox="0 0 21.304 17.296"
                    >
                      <g transform="translate(1.505 2)">
                        <rect width="17.226" height="5" rx="2.5" transform="translate(4.082 10.181) rotate(-45)" />
                        <rect width="10.91" height="5" rx="2.5" transform="translate(2.03 4.047) rotate(45)" />
                      </g>
                    </svg>
                  )}
                </button>
              )}

              <div className={`countdown-container ${
                (activeOverlay === 'list' || activeOverlay === 'edit') 
                  ? 'fade-out-no-delay' 
                  : firstAnimationClass.current.accept
              }`}>
                <p>{isAddressReleased ? "ADDRESS:" : "ADDRESS IS RELEASED IN:"}</p>
                {isAddressReleased ? (
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="countdown-timer"
                  >
                    {countdown}
                  </a>
                ) : (
                  <h1 className="countdown-timer">{countdown}</h1>
                )}
              </div>
            </>
          )}
        </div>

        <div 
          className={`event-link-button ${
            (activeOverlay === 'list' || activeOverlay === 'edit') ? 'fade-out-no-delay' : firstAnimationClass.current.link
          }`}
          onClick={handleShare}
        >
          <div className='link-text-wrapper'>
            <h1 className='link'>{eventLink}</h1>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="19.023" height="19.165" viewBox="0 0 19.023 19.165">
            <g id="Group_31" data-name="Group 31" transform="translate(232.005 683.461) rotate(180)">
              <rect id="Rectangle_37" data-name="Rectangle 37" width="3.579" height="19.023" rx="1.79" transform="translate(232.005 672.089) rotate(90)" fill="#fff"/>
              <rect id="Rectangle_38" data-name="Rectangle 38" width="3.581" height="12.5" rx="1.791" transform="translate(224.353 680.928) rotate(135)" fill="#fff"/>
              <rect id="Rectangle_62" data-name="Rectangle 62" width="3.581" height="12.502" rx="1.791" transform="translate(221.822 664.296) rotate(45)" fill="#fff"/>
            </g>
          </svg>
        </div>

      </div>

      <div className={`event-overlay ${activeOverlay === 'list' ? 'active' : ''}`}>
        {activeOverlay === 'list' && (
          <div className="attendees-list-container">

            <div className='list-header'>
              <h2 className="list-name">List</h2>
              <p className='list-amount'>{attendees.length} GOING</p>
            </div>
      
            <div className='list-scroll-wrapper'>
              <div className='list-scrollable'>
                <ul className="list">
                  {attendees.length > 0 ? (
                    attendees.map((attendee, index) => (
                      <li
                        key={index}
                        className="attendee fade-in"
                        style={{ animationDelay: `${0.025 * index}s` }}
                      >
                        <span className="attendee-link" onClick={() => navigate(`/profile/${attendee}`)}>
                          @{attendee}
                        </span>
                      </li>
                    ))
                  ) : (
                    <p>No attendees yet.</p>
                  )}
                </ul>
              </div>
              <div className="fade-top"></div>
              <div className="fade-bottom"></div>
            </div>

          </div>
        )}
      </div>

      <div className={`event-overlay ${activeOverlay === 'edit' ? 'active' : ''}`}>
        {activeOverlay === 'edit' && isHost && (
          <div className="edit-panel fade-in">
            <div className="edit-inputs-wrapper">

              <CustomInput
                label="Title"
                placeholder="Title"
                value={eventData.event_name}
                onChange={(e) => setEventData({ ...eventData, event_name: e.target.value })}
                inputType="name"
                multiline={true}
                wrap={false}
                count={true}
                maxChar={40}
              />

              <CustomInput
                label="Description"
                placeholder="Description"
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                inputType="description"
                multiline={true}
                wrap={false}
                count={true}
                maxChar={100}
              />

              <CustomInput
                label="Address"
                placeholder="Address"
                value={eventData.address}
                onChange={(e) => setEventData({ ...eventData, address: e.target.value })}
                inputType="text"
                wrap={false}
                count={false}
              />
                
              <div className='date-time-row'>
                <div className="event-page__input-container fade-in" style={{ animationDelay: '0.1s' }}>
                  <label htmlFor="event-date-edit" className="event-page__input-label">Date</label>
                  <input
                    type="date"
                    id="event-date-edit"
                    className="event-input"
                    value={eventData.date_time ? new Date(eventData.date_time).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const time = new Date(eventData.date_time).toISOString().split('T')[1];
                      const combined = new Date(`${e.target.value}T${time}`).toISOString();
                      setEventData({ ...eventData, date_time: combined });
                    }}
                  />
                </div>
      
                <div className="event-page__input-container fade-in" style={{ animationDelay: '0.1s' }}>
                  <label htmlFor="event-time-edit" className="event-page__input-label">Time</label>
                  <input
                    type="time"
                    id="event-time-edit"
                    className="event-input"
                    value={eventData.date_time ? new Date(eventData.date_time).toTimeString().substring(0, 5) : ''}
                    onChange={(e) => {
                      const date = new Date(eventData.date_time).toISOString().split('T')[0];
                      const combined = new Date(`${date}T${e.target.value}`).toISOString();
                      setEventData({ ...eventData, date_time: combined });
                    }}
                  />
                </div>
              </div>


              <div className='event-upload-row fade-in' style={{ animationDelay: '0.2s' }}>
                <input
                  type="file"
                  id="edit-photo-upload"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEventData({ 
                          ...eventData, 
                          image: file,
                          imagePreview: URL.createObjectURL(file)
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="event-input-photo"
                  accept="image/*"
                />
                {eventData.image && (
                  <label htmlFor="edit-photo-upload">
                    <img src={eventData.imagePreview || eventData.image} alt="Preview" className="image-preview clickable" />
                  </label>
                )}
              </div>
    
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default EventPage;
