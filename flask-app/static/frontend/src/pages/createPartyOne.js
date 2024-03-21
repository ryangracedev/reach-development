import React from 'react';
import { useEvent } from '../context/eventContext'; // Import useEvent
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Logo from '../components/logo';
import InputArea from '../components/inputArea';
import CheckMarkBtn from '../components/checkMarkBtn';
import './createPartyOne.css'

function CreatePartyOne() {

  const { eventData } = useEvent();

  const navigate = useNavigate(); // Initialize useNavigate


  // A simplified handleSubmit that could be moved to App.js or another component
  const handleSubmit = async () => {
    console.log(eventData); // Here you can also perform the fetch operation
    navigate('/create-party-extra'); // Navigate to CreatePartyTwo
    // Assuming fetch operation is moved to App.js or triggered when all data is collected


    // The fetch operation can eventually be placed here or elsewhere, depending on your app's flow
    // Remember to replace '/create-event' with your actual backend endpoint URL
    /*
    const response = await fetch('/create-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    const responseData = await response.json();
    console.log(responseData);
    */
  };


  return (
    <div className="Create-Page-One">
      <Logo />
      <InputArea />
      <CheckMarkBtn  classNameBtn = 'Check' text = 'Next' onClick={handleSubmit}/>
    </div>
  );
}

export default CreatePartyOne;
