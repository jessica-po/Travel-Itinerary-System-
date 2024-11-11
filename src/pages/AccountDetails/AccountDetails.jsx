import React, { useEffect } from "react";
import styles from './AccountDetails.module.css';

export default function AccountDetails() {

    useEffect(() => {
        document.title = "Account Details - Travel Itineraries";
    });

    return (
        <div className="account">
            <h2>Account Details / Manage Account Page</h2>
        </div>
    );
}
