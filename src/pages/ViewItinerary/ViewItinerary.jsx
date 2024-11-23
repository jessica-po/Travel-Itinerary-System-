import { Link, useParams} from "react-router-dom";
import React, { useEffect, useState } from "react";
import styles from './ViewItinerary.module.css';
import useAuth from "../../hooks/useDatabase";

export default function ViewItinerary() {
    const { postId } = useParams();
    const [ events, setEvents] = useState([]);
    const { getItineraries, getEvents, getRatings, upsertRating, insertReport, insertRating, getLoggedInUser } = useAuth();
    const [ filteredEvents, setFilteredEvents] = useState([]);
    const [ itinerary, setItinerary] = useState({});
    const [ myRating, setMyRating ] = useState([]);
    const [userId, setUserId] = useState(null);
    //const [myRateIsGood, setMyRateIsGood] = useState(false);
    

    useEffect(() => {
        document.title = "View Itinerary - Travel Itineraries";
        if (postId) {
            loadEvents();
            loadItineraries();
            const fetchUser = async () => {
                const { user, error } = await getLoggedInUser();
                if (error || !user) {
                    console.error("Error fetching user:", error);
                } else {
                    setUserId(user.id);
                    if (userId) {loadMyRating()};
                    
                }
            };
            fetchUser();
        }
    }, [postId, userId]);

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

    const loadMyRating = async () => {
        const { data, error } = await getRatings();
        if (!error) {
            const matchedRating = data.find(rating => rating.user_id === userId);
            setMyRating(matchedRating); 
        } else {
            console.error("Error fetching myRating:", error);
        }
    };

    const filterEvents = (events) => {
        const filtered = events.filter(event => event.post_id === postId);
        setFilteredEvents(filtered);
    };

    const handleSubmit = async (e, myRateIsGood) => {
        e.preventDefault();
        if (!userId) {
          alert("You must be logged in to rate.");
          return;
        }

        setMyRating({ ...myRating, is_good: myRateIsGood});

        try {
        const newRating = {
          user_id: userId,
          post_id: postId,
          is_good: myRateIsGood,
          comment: null, 
          comment_date: new Date().toISOString(),
        }; 
        
            const { data: ratingData, error: ratingError } = await upsertRating(newRating);
            if (ratingError) {
                console.error("Error inserting rating:", ratingError);
                return; // Prevent further execution
            }
            
            return;
            
        } catch (err) {
            alert(err);
        }

        if (ratingError) {
          console.error("Failed to rate itinerary:", ratingError);
          alert("Failed to rate itinerary. Please try again.");
          return;
        }
        console.log("Rating inserted:", ratingData);
    }




    return (
        <div className={styles.viewItinerary}>
            <h1>{itinerary.post_name}</h1>
            {/* Buttons*/}
            <div>
                <button className={styles.buttons}>
                    Add to Google Calendar
                </button>
                <button className={styles.buttons}>
                    Add to Saved Itineraries WIP
                </button >
                <Link to={`/report-form/${itinerary.post_id}`}>
                    <button className={styles.buttons}>
                        Report WIP
                    </button>
                </Link>
                <Link to={`/comments/${itinerary.post_id}`}>
                    <button className={styles.buttons}>
                        Comments
                    </button>
                </Link>
                Rating: __%
                <button
                    className={`${styles.rateButtons} ${(myRating?.is_good || false) ? styles.pressed : ''}`}
                    onClick={(e) => handleSubmit(e, true)}
                >
                    +
                </button>
                <button
                    className={`${styles.rateButtons} ${(myRating?.is_good === false) ? styles.pressed : ''}`}
                    onClick={(e) => handleSubmit(e, false)}
                >
                    -
                </button>
            </div>
            <div className={styles.eventsContainer}>
                <table className={styles.itineraryTable}>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Time</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                    <tbody>
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => (
                            <tr
                                key={`${event.post_id}-${event.day}-${event.time}`}
                                className={styles.eventItem}
                            >
                                <td className={styles.eventDetails}>
                                    <span className={styles.day}>Day {event.day}</span>
                                </td>
                                <td className={styles.eventDetails}>
                                    <span className={styles.time}>{event.time}</span>
                                </td>
                                <td className={styles.eventDetails}>
                                    <span className={styles.location}>{event.location}</span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <p>No events.</p>
                    )}
                    </tbody>
                </table>
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