import React from "react";
import '../styles/checkMarkBtn.css';

function CheckMarkBtn({ classNameBtn = '', text = '', onClick }) {
    // Create class name for button type
    const nameClass = `Button ${classNameBtn}`
    return (
        <div className="Check-Mark-Btn" onClick={onClick}>
            <div className={nameClass}></div>
            <h1 className="Text">{text}</h1>
        </div>
    )
}

export default CheckMarkBtn;