import React, { useRef, useState, useEffect } from 'react';
import './style/CustomInput.css'; // Import the styles

const CustomInput = ({ 
  label,
  placeholder,
  onClick,
  value,
  onChange, 
  inputType = "text", 
  wrap, 
  multiline = false, 
  count, 
  errorMessage, 
  errorVisible,
  inputDescription,
  maxChar, 
  isDescription,
  isAddressInput = false,
  isNormalInput = false
}) => {

  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef(null);
    
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
      {multiline ? (
        <textarea
          ref={textareaRef}
          className={`custom-input-field__multiline ${isDescription ? 'description-input' : ''}`}
          placeholder={placeholder}
          onClick={onClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChange={handleChange}
        />
      ) : (
        <input
          className={`custom-input-field ${isDescription ? 'description-input' : ''}`}
          placeholder={placeholder}
          onClick={onClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChange={handleChange}
        />
      )}
      <p
        className={`input-description${isNormalInput ? ' normal-input' : ''} ${!errorVisible && !isFocused && !value ? 'visible' : ''} ${isAddressInput ? 'address-adjust' : ''}`}
      >
        {inputDescription}
      </p>
      <div className={`error-message-container ${errorVisible ? 'visible' : ''}`}>
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default CustomInput;