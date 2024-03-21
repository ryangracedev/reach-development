import React from 'react';
import { useEvent } from '../context/eventContext';
import InputField from './inputField';
import AddPicture from './addPicture';
import '../styles/inputArea.css'

function InputArea() {
  const { eventData, updateEventData } = useEvent();

  // Handlers for input changes, leveraging the context's update function
  const handleNameChange = (e) => {
    updateEventData({ eventName: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    updateEventData({ eventDescription: e.target.value });
  };
  return (
    <div className="Input-Area">

        <AddPicture />

        <InputField 
          label='Name' 
          placeholder='Untitled Event' 
          value={eventData.eventName}
          onChange={handleNameChange}
        />

        <InputField 
          classNameDescription='Description-large' 
          label='About' 
          placeholder='Description of event...' 
          isTextArea={true}
          value={eventData.eventDescription}
          onChange={handleDescriptionChange}
        />

    </div>
  );
}

export default InputArea;
