import React, { useEffect } from "react";
import styles from './Home.module.css';

export default function Home() {

    useEffect(() => {
        document.title = "Home - Travel Itineraries";
    });

    return (
        <div className="home">
            <h2>Home Page</h2>
        </div>
    );
}
