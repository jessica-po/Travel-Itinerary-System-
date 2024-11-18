import React, { useEffect, useState } from "react";
import styles from './Home.module.css';
import useAuth from "../../hooks/useDatabase";
import { Link } from "react-router-dom";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

export default function Home() {
    const [ itineraries, setItineraries ] = useState([]);
    const [ ratings, setRatings ] = useState([]);
    const { getItineraries, getRatings } = useAuth();

    useEffect(() => {
        document.title = "Home - Travel Itineraries";
        loadItineraries();
    }, []);

    useEffect(() => {
        updateItineraryRatings();
    }, [ratings]);

    const loadItineraries = async () => {
        const { data, error } = await getItineraries();
        if (!error) {
            setItineraries(data);
            loadRatings();
        } else {
            alert("Error loading itineraries. Check the console for more details.")
            console.log(error);
        }
    };

    const loadRatings = async () => {
        const { data, error } = await getRatings();
        if (!error) {
            setRatings(data);
        } else {
            alert("Error loading post ratings. Check the console for more details.")
            console.log(error);
        }
    }

    const addItineraryRatings = () => {
        return itineraries.map(itinerary => ({
            ...itinerary,
            good_count: ratings.find(r => r.post_id === itinerary.post_id && r.is_good)?.total || 0,
            bad_count: ratings.find(r => r.post_id === itinerary.post_id && !r.is_good)?.total || 0
        }))
    };

    const updateItineraryRatings = () => {
        setItineraries(
            addItineraryRatings()
            .sort((a, b) => {
                let a_rating = a.good_count / (a.good_count + a.bad_count);
                let b_rating = b.good_count / (b.good_count + b.bad_count);
                if (isNaN(a_rating) && isNaN(b_rating)) return 0;
                if (isNaN(a_rating)) return 1;
                if (isNaN(b_rating)) return -1;
                
                return b_rating - a_rating;
            })
        );
    }

    return (
        <div className="home">
            <div>
                <h2>Welcome to Travel Itineraries!</h2>
                <p>Here you can find all the best itinerary plans, made for travellers like you, by travellers like you.</p>    
            </div>
            
            <div className="itineraries">
                <h2>Featured Itinerary</h2>
                <div className="featuredItinerary">
                    <Link to={`/view-itinerary/${itineraries[0]?.post_id}`}>
                        <img src={itineraries[0]?.image_url} alt={itineraries[0]?.post_name} className={styles.itineraryImage} />
                        <p>{itineraries[0]?.post_name || itineraries[0]?.destination}</p>
                        <p></p>
                    </Link>
                </div>
                
                <h2>More Itineraries</h2>
                <div className="otherItineraries">
                    <table className={styles.itineraryTable}>
                        <thead>
                            <tr>
                                <th>Itinerary</th>
                                <th>Rating</th>
                            </tr>
                        </thead>

                        <tbody>
                            {itineraries.slice(1).map(itinerary =>
                                <tr key={itinerary.post_id}>
                                        <td>
                                            <Link to={`/view-itinerary/${itinerary.post_id}`} key={itinerary.post_id}>
                                                {itinerary.post_name || itinerary.destination}
                                            </Link>
                                        </td>
                                        <td>
                                            { itinerary.good_count + itinerary.bad_count > 0 ? <div className={styles.ratingContainer}>
                                                <ThumbUpIcon className={styles.ratingIcon} />
                                                <span className={styles.rating}>
                                                    {Math.round(itinerary.good_count / (itinerary.good_count + itinerary.bad_count) * 100)}%
                                                </span>
                                                <span className={styles.ratingCount}>
                                                    {itinerary.good_count + itinerary.bad_count} rating{itinerary.good_count + itinerary.bad_count !== 1 && "s"}
                                                </span>
                                            </div> : <>
                                                No Ratings
                                            </>}
                                        </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
