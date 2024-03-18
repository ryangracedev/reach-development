import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/createBtn.css';

function CreateBtn() {

  let navigate = useNavigate();

  function handleCreatePartyClick() {
    navigate('/create-party'); // Path defined in your App.js
  }

  return (
    <div onClick={handleCreatePartyClick} className="CreateBtn">
      <h1 className='Create-Button-Top'>CREATE A</h1>
      <h1 className='Create-Button-Bottom'>PARTY</h1>
    </div>
  );
}

export default CreateBtn;