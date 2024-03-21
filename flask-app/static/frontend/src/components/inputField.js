import React from 'react';
import '../styles/inputField.css';

function InputField({ 
  classNameTextName = '',
  classNameDescription = '',
  label = '',
  placeholder = '',
  isTextArea = false, 
  value, 
  onChange }) {
  // Create class name for Name section
  const nameClass = `Name ${classNameTextName}`
  // Create class name for Description section
  const descriptionClass = `Description ${classNameDescription}`
  // Return
  return (
    <div className="Input-Field">

      <h1 className={nameClass}>{label}</h1>
      {
        // If we want description to be a text area
        isTextArea ? (
          // Yes?
          <textarea
            className={descriptionClass} 
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          ></textarea> 
        ) : (
          // No?
          <input 
            className={descriptionClass} 
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        )
      }

    </div>
  );
}

export default InputField;