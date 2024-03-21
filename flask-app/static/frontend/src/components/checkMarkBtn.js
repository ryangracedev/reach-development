import React from "react";
import '../styles/checkMarkBtn.css';

function CheckMarkBtn({ classNameBtn = '', classNameDuo = '', text = '', onClick }) {
    // Create class name for button type
    const nameClass = `Button ${classNameBtn}`
    const btnClass = `Check-Mark-Btn ${classNameDuo}`
    return (
        <div className={btnClass} onClick={onClick}>
            <div className={nameClass}></div>
            <h1 className="Text">{text}</h1>
        </div>
    )
}

export default CheckMarkBtn;