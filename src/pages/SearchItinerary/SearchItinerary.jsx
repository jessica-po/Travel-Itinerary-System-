import React, { useEffect } from "react";
import styles from './SearchItinerary.module.css';

export default function searchItinerary() {

    useEffect(() => {
        document.title = "Find Itineraries - Travel Itineraries";
    });

    return (
        <div className="search-itinerary">
            <h2>The Itinerary List w/ Filters page</h2>
        </div>
    );
}
