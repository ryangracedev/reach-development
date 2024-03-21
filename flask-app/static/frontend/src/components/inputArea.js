import React from 'react';
import InputField from './inputField';
import AddPicture from './addPicture';
import '../styles/inputArea.css'

function InputArea({ eventName, setEventName, eventDescription, setEventDescription }) {
  return (
    <div className="Input-Area">

        <AddPicture />

        <InputField 
          label='Name' 
          placeholder='Untitled Event' 
          value={eventName} 
          onChange={(e) => setEventName(e.target.value)}
        />

        <InputField 
          classNameDescription='Description-large' 
          label='About' 
          placeholder='Description of event...' 
          isTextArea={true}
          value={eventDescription} 
          onChange={(e) => setEventDescription(e.target.value)}
        />

    </div>
  );
}

export default InputArea;
