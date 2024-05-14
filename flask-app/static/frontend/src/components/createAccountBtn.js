import React from "react";
import '../styles/createAccountBtn.css'

function CreateAccountBtn({ text = '' }) {

    return (
        <div className="Account-Button">
            <h1 className="Account-Text">{text}</h1>
        </div>
    )
}

export default CreateAccountBtn;