import React, { useEffect } from "react";
import styles from './MyItineraries.module.css';

export default function MyItineraries() {

    useEffect(() => {
        document.title = "My Itineraries - Travel Itineraries";
    });

    return (
        <div className="my-itineraries">
            <h2>My Itineraries (Page)</h2>
        </div>
    );
}
