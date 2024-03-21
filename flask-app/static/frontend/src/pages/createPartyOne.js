import React, { useState } from 'react';
import Logo from '../components/logo';
import InputArea from '../components/inputArea';
import CheckMarkBtn from '../components/checkMarkBtn';
import './createPartyOne.css'

function CreatePartyOne() {

  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const handleSubmit = async () => {
    const eventData = { eventName, eventDescription };

    const response = await fetch('/create-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    const responseData = await response.json();
    console.log(responseData);
    // Additional logic to handle response, like redirecting the user
  };

  return (
    <div className="Create-Page-One">
      <Logo />
      <InputArea 
        eventName={eventName}
        setEventName={setEventName}
        eventDescription={eventDescription}
        setEventDescription={setEventDescription}
      />
      <CheckMarkBtn  classNameBtn = 'Check' text = 'Next' onClick={handleSubmit}/>
    </div>
  );
}

export default CreatePartyOne;
