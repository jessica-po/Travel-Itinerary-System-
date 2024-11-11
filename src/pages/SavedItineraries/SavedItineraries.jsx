import React, { useEffect } from "react";
import styles from './SavedItineraries.module.css';

export default function SavedItineraries() {

    useEffect(() => {
        document.title = "Saved Itineraries - Travel Itineraries";
    });

    return (
        <div className="saved-itineraries">
            <h2>Saved Itineraries Page</h2>
        </div>
    );
}
