import React, { useEffect } from "react";
import styles from './Login.module.css';

export default function Login() {

    useEffect(() => {
        document.title = "Login - Travel Itineraries";
    });

    return (
        <div className="login">
            <h2>Login Page</h2>
        </div>
    );
}
