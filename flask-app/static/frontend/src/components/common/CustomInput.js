import React, { useState, useEffect } from 'react';
import './style/CustomInput.css'; // Import the styles

const CustomInput = ({ label, placeholder, onClick, value, onChange, inputType = "text", wrap, count, errorMessage, errorVisible, maxChar }) => {

  const [isFocused, setIsFocused] = useState(false);
    
  let maxCount = maxChar;

  const handleFocus = () => {
    console.log("Input focused");
    setIsFocused(true);
  };

  const handleBlur = () => {
    console.log("Input not focused");
    setIsFocused(false);

    // Wait for keyboard to fully close
    setTimeout(() => {
      // Force a viewport reflow by scrolling then resetting
      const scrollY = window.scrollY;
      window.scrollTo({ top: scrollY === 0 ? 1 : scrollY - 1, behavior: 'smooth' });
      setTimeout(() => {
        window.scrollTo({ top: scrollY, behavior: 'smooth' });
      }, 50);
    }, 50);
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
      <div className={`error-message-container ${errorVisible ? 'visible' : ''}`}>
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default CustomInput;