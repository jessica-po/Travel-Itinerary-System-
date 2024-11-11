import React, { useEffect, useState } from "react";
import styles from './Home.module.css';
import useAuth from "../../hooks/useDatabase";

export default function Home() {
    const [ itineraries, setItineraries ] = useState([]);
    const { getItineraries } = useAuth();

    useEffect(() => {
        document.title = "Home - Travel Itineraries";
    });

    const handleTestDatabase = async () => {
        const { data, error } = await getItineraries();

        setItineraries(data);
        
        console.log("data?:");
        console.log(data);
        console.log("error?:");
        console.log(error);
        document.getElementById("sample-output").innerText = `(Check console!): ${data}`;
    };

    return (
        <div className="home">
            <h2>Home Page</h2>
            <button type="button" onClick={handleTestDatabase}>Test Database</button>
            <div id="sample-output">Sample</div>
            <div className="container">
                <ol>
                    {itineraries.map(itinerary => <li key={itinerary.post_id}>{itinerary.post_name || itinerary.destination}</li>)}
                </ol>
            </div>
        </div>
    );
}
