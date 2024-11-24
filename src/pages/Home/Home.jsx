import React, { useEffect, useState } from "react";
import styles from './Home.module.css';
import { Link } from "react-router-dom";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import useSupabase from "../../context/SupabaseContext";

export default function Home() {
    const [ itineraries, setItineraries ] = useState([]);
    const [ ratings, setRatings ] = useState([]);
    const { getItineraries, getRatings } = useSupabase();

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
            good_count: ratings.filter(r => r.post_id === itinerary.post_id && r.is_good)?.length || 0,
            bad_count: ratings.filter(r => r.post_id === itinerary.post_id && !r.is_good)?.length || 0
        }))
    };

    const updateItineraryRatings = () => {
        setItineraries(
            addItineraryRatings()
            .sort((a, b) => {
                let a_num_ratings = a.good_count + a.bad_count;
                let b_num_ratings = b.good_count + b.bad_count;
                let a_rating = a.good_count / a_num_ratings;
                let b_rating = b.good_count / b_num_ratings;
                if (isNaN(a_rating) && isNaN(b_rating)) return 0;
                if (isNaN(a_rating)) return 1;
                if (isNaN(b_rating)) return -1;
                if (a_rating === b_rating) return b_num_ratings - a_num_ratings;
                
                return b_rating - a_rating;
            })
        );
    }

    return (
        <div className="home">
            <Button onClick={() => console.log(user)}>Log User in console (TEMPORARY)</Button>
            <Stack spacing={5}>
                <Card>
                    <CardContent>
                        <Typography variant="h2">Welcome to Travel Itineraries!</Typography>
                        <Typography variant="subtitle1">Here you can find all the best itinerary plans, made for travellers like you, by travellers like you.</Typography>
                    </CardContent>
                </Card>

                <Card variant="outlined">
                    <CardActionArea href={`/view-itinerary/${itineraries[0]?.post_id}`}>
                        <CardContent>
                            <Typography variant="h3">{itineraries[0]?.post_name || itineraries[0]?.destination}</Typography>
                            <Typography variant="overline">Featured Itinerary</Typography>
                            <CardMedia component="img" height="500" image={itineraries[0]?.image_url} />
                        </CardContent>
                        <CardActions>
                            <Button>
                                View this itinerary
                            </Button>
                        </CardActions>
                    </CardActionArea>
                </Card>

                <Card>
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Itinerary</TableCell>
                                    <TableCell>Rating</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {itineraries.slice(1).map(itinerary =>
                                    <TableRow key={itinerary.post_id} hover>
                                        <TableCell>
                                            <Link to={`/view-itinerary/${itinerary.post_id}`}>
                                                {itinerary.post_name || itinerary.destination}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Stack>
        </div>
    );
}
