import { Link, useParams} from "react-router-dom";
import React, { useEffect, useState } from "react";
import styles from './ViewItinerary.module.css';
import useAuth from "../../hooks/useDatabase";

export default function ViewItinerary() {
    const { postId } = useParams();
    const [events, setEvents] = useState([]);
    const { getItineraries, getEvents } = useAuth();
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [itinerary, setItinerary] = useState({});

    useEffect(() => {
        document.title = "View Itinerary - Travel Itineraries";
        if (postId) {
            loadEvents();
            loadItineraries();
        }
    }, [postId]);

    const loadEvents = async () => {
        const { data, error } = await getEvents();
        if (!error) {
            setEvents(data);
            filterEvents(data);
        } else {
            console.error("Error fetching events:", error);
        }
    };

    const loadItineraries = async () => {
        const { data, error } = await getItineraries();
        if (!error) {
            const matchedItinerary = data.find(itinerary => itinerary.post_id === postId);
            setItinerary(matchedItinerary);
        } else {
            console.error("Error fetching itinerary:", error);
        }
    };

    const filterEvents = (events) => {
        const filtered = events.filter(event => event.post_id === postId);
        setFilteredEvents(filtered);
    };

    

    return (
        <div className={styles.viewItinerary}>
            <h1>{itinerary.post_name}</h1>
            {/* Buttons*/}
            <div className={styles.buttons}>
                <button>
                    Add to Google Calendar
                </button>
                <button>
                    Add to Saved Itineraries NEED AUTH
                </button>
                <Link to={`/report-form/${itinerary.post_id}`}>
                    <button>
                        Report NEED AUTH
                    </button>
                </Link>
                <Link to={`/comments/${itinerary.post_id}`}>
                    <button>
                        Comments
                    </button>
                </Link>
                Rating: __%
                <button>
                    + NEED AUTH
                </button>
                <button>
                    - NEED AUTH
                </button>
            </div>
            <div className={styles.eventsContainer}>
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <div
                            key={`${event.post_id}-${event.day}-${event.time}`}
                            className={styles.eventItem}
                        >
                            <p className={styles.eventDetails}>
                                <span className={styles.day}>Day {event.day}</span> |
                                <span className={styles.time}>{event.time}</span> |
                                <span className={styles.location}>{event.location}</span>
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No events.</p>
                )}
            </div>
            
            {itinerary ? (
                <div className={styles.itineraryDetails}>
                    <p><strong>Destination:</strong> {itinerary.destination}</p>
                    <p><strong>Price Range:</strong> ${itinerary.price_low} - ${itinerary.price_high}</p>
                    <p><strong>Duration:</strong> {itinerary.duration} days</p>
                    <p><strong>Group Size:</strong> {itinerary.group_size} people</p>
                    <p><strong>Family Friendly:</strong> {itinerary.is_family_friendly ? 'Yes' : 'No'}</p>
                    <p><strong></strong> {itinerary.description} </p>
                    <img src={itinerary.image_url} alt={itinerary.post_name} className={styles.itineraryImage} />
                </div>
            ) : (
                <p>No itinerary found for this post_id.</p>
            )}
        </div>
    );
    
}