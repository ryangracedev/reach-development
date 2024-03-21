import React from 'react';
import { useEvent } from '../context/eventContext';
import InputField from './inputField';
import '../styles/inputAreaLocationTime.css'

function InputAreaLocationTime() {
  const { eventData, updateEventData } = useEvent();

  // Handlers for input changes, leveraging the context's update function
  const handleLocationChange = (e) => {
    updateEventData({ eventAddress: e.target.value });
  };

  const handleDateChange = (e) => {
    updateEventData({ eventDate: e.target.value });
  };

  const handleTimeChange = (e) => {
    updateEventData({ eventTime: e.target.value });
  };

  return (
    <div className="Input-Area-Location-Time">

        <InputField 
          label='Where' 
          placeholder='Your address is hidden until 3 hours before it starts' 
          value={eventData.eventAddress}
          onChange={handleLocationChange}
        />

        <InputField 
          label='When' 
          placeholder='What day is it?'
          value={eventData.eventDate}
          onChange={handleDateChange}
        />

        <InputField 
          label='Time' 
          placeholder='What time does it start?' 
          value={eventData.eventTime}
          onChange={handleTimeChange}
        />

    </div>
  );
}

export default InputAreaLocationTime;
