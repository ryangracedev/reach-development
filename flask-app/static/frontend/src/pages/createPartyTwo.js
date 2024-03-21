import React from 'react';
import { useEvent } from '../context/eventContext'; // Import useEvent
import Logo from '../components/logo';
import InputAreaTwo from '../components/inputAreaLocationTime';
import Footer from '../components/footerButtons';
import './createPartyTwo.css'

function CreatePartyTwo() {

  const { eventData } = useEvent();

  // A simplified handleSubmit that could be moved to App.js or another component
  const handleSubmit = async () => {
    console.log(eventData); // Here you can also perform the fetch operation
    // Assuming fetch operation is moved to App.js or triggered when all data is collected
  };


  return (
    <div className="Create-Page-Two">
      <Logo />
      <InputAreaTwo />
      <Footer />
    </div>
  );
}

export default CreatePartyTwo;
