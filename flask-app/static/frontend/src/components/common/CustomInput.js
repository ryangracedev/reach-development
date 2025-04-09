import React, { useState } from 'react';
import './style/CustomInput.css'; // Import the styles

const CustomInput = ({ label, placeholder, onClick, value, onChange, inputType = "text", wrap, count }) => {

  const [isFocused, setIsFocused] = useState(false);
    
  let maxCount = null;
  if (inputType === 'description') maxCount = 70;
  if (inputType === 'name') maxCount = 40; // assuming average word length for 50 words

  const handleFocus = () => {
    console.log("Input focused");
    setIsFocused(true);
  };

  const handleBlur = () => {
    console.log("Input not focused");
    setIsFocused(false);
  };

  const handleChange = (e) => {
    const inputVal = e.target.value;

    if (inputType === 'name') {
      const wordCount = inputVal.trim().split(/\s+/).length;
      if (wordCount > maxCount) return;
    }

    if (maxCount && inputVal.length > maxCount) return;

    onChange(e);
  };

  return (
    <div className="custom-input-container">
      <div className='top-bar'>
        <label className={`custom-input-label ${isFocused || value ? 'focused' : ''}`}>{label}</label>
        {count && (
          <div className={`char-count ${isFocused ? 'focused' : ''}`}>
            { value.length} / {maxCount}
          </div>
        )}
      </div>
      {wrap ? (
        <textarea
          className="custom-input-field"
          placeholder={placeholder}
          onClick={onClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChange={handleChange}
        />
      ) : (
        <input
          className="custom-input-field"
          placeholder={placeholder}
          onClick={onClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChange={handleChange}
        />
      )}
      {/* <div className="custom-input-underline" /> */}
    </div>
  );
};

export default CustomInput;