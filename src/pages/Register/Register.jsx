import React, { useEffect } from "react";
import styles from './Register.module.css';

export default function Register() {

    useEffect(() => {
        document.title = "Register - Travel Itineraries";
    });

    return (
        <div className="register">
            <h2>Register Page</h2>
        </div>
    );
}
