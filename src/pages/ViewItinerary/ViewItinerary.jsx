import { Link, useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import styles from "./ViewItinerary.module.css";
import { Button, ButtonGroup } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import useSupabase from "../../context/SupabaseContext";

export default function ViewItinerary() {
	const { postId } = useParams();
	const [events, setEvents] = useState([]);
	const {
		getItineraries,
        getPostRatings,
		getEvents,
		getRatings,
		upsertRating,
		insertReport,
		insertRating,
		user,
		userProfile,
        clearReports,
		banPost,
		banUserId,
		saveItinerary,
	} = useSupabase();
	const [filteredEvents, setFilteredEvents] = useState([]);
	const [itinerary, setItinerary] = useState({});
	const [myRating, setMyRating] = useState({is_good: null});
    const [postRating, setPostRating] = useState(0);
	// const [userId, setUserId] = useState(null);
	//const [myRateIsGood, setMyRateIsGood] = useState(false);
	const [googleCalendarUrl, setGoogleCalendarUrl] = useState("https://calendar.google.com/calendar/u/0/r/eventedit");
	const [showBanPostModal, setShowBanPostModal] = useState(false);
	const [showBanUserModal, setShowBanUserModal] = useState(false);
    const [showClearReportsModal, setShowClearReportsModal] = useState(false);
    const navigate = useNavigate(); 

	useEffect(() => {
		document.title = "View Itinerary - Travel Itineraries";
		if (postId) {
			loadEvents();
			loadItineraries();
            loadPostRatings();
            
			if (user) {
				if (user.id) loadMyRating();
			}
			// const fetchUser = async () => {
			//     const { user, error } = await getLoggedInUser();
			//     if (error || !user) {
			//         console.error("Error fetching user:", error);
			//     } else {
			//         setUserId(user.id);
			//         if (userId) {loadMyRating()};

			//     }
			// };
			// fetchUser();
		}
	}, [postId, user]);

	useEffect(() => {
		if (filteredEvents.length > 0 && itinerary.post_id) {
			setGoogleCalendarUrl(createUrl(filteredEvents, itinerary));
		}
	}, [filteredEvents]);

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
			const matchedItinerary = data.find((itinerary) => itinerary.post_id === postId);
			setItinerary(matchedItinerary);
		} else {
			console.error("Error fetching itinerary:", error);
		}
	};

    const loadPostRatings = async () => {
		const { data, error } = await getPostRatings();
		if (!error) {
			const matchedGoodPostRating = data.find((post) => post.post_id === postId && post.is_good === true) || { total: 0 };
            const matchedBadPostRating = data.find((post) => post.post_id === postId && post.is_good === false) || { total: 0 };
            const total = matchedGoodPostRating.total + matchedBadPostRating.total;

            const calcPostRating = total === 0 ? 0 : Math.round((100 * matchedGoodPostRating.total / total));
            setPostRating(calcPostRating); 
			
		} else {
			console.error("Error fetching postRating:", error);
		}
	};

	const loadMyRating = async () => {
		const { data, error } = await getRatings();
		if (!error) {
			const matchedRating = data.find((rating) => rating.user_id === user.id && rating.post_id === postId);
			setMyRating(matchedRating);
            
		} else {
			console.error("Error fetching myRating:", error);
		}
	};

	const filterEvents = (events) => {
		const filtered = events.filter((event) => event.post_id === postId);
		setFilteredEvents(filtered);
	};

	const handleSubmit = async (e, myRateIsGood) => {
		e.preventDefault();
		if (!user) {
			alert("You must be logged in to rate.");
			return;
		}

		try {
			const newRating = {
				user_id: user.id,
				post_id: postId,
				is_good: myRateIsGood,
			};

			const { data: ratingData, error: ratingError } = await upsertRating(newRating);
			if (ratingError) {
				console.error("Error inserting rating:", ratingError);
				return;
			}
            setMyRating({ ...myRating, is_good: myRateIsGood });
            await loadPostRatings();

		} catch (err) {
			alert(err);
		}

		console.log("Rating inserted:", ratingData);
	};

	// const handleBanPost = async () => {
	// 	const error = await banPost(itinerary.post_id);

	// 	if (error) {
	// 		alert(error.message);
	// 		console.error(error);
	// 	}
	// };

	// const handleBanUser = async () => {
	// 	const { banUserAuth, banUser, banUserPosts } = banUserId(itinerary.user_id);

	// 	const response = await Promise.all([banUserAuth, banUser, banUserPosts]);

	// 	if (response[0].error || response[1].error || response[2].error) {
	// 		alert("Error occurred while trying to ban user");
	// 		if (response[0].error) console.error(response[0].error);
	// 		if (response[1].error) console.error(response[1].error);
	// 		if (response[2].error) console.error(response[2].error);
	// 	} else {
	// 		alert("User banned for 1 year and all associated posts successfully banned.");
	// 	}
	// };

	const handleBanPost = () => {
		setShowBanPostModal(true);
	};

	const handleBanUser = () => {
		setShowBanUserModal(true);
	};

    const handleClearReports = () => {
		setShowClearReportsModal(true);
	};

    const confirmClearReports = async () => {
        const error = await clearReports(itinerary.post_id);


        if (error) {
            alert(error.message);
            console.error(error);
        } else {
			alert("Reports have been cleared.");
            //navigate('/../admin-search');
		}
		setShowClearReportsModal(false);
    };


	const confirmBanPost = async () => {
		const error = await banPost(itinerary.post_id);
        

		if (error) {
			alert(error.message);
			console.error(error);
		} else {
			alert("Itinerary has been banned.");
            navigate('/../admin-search');
		}
		setShowBanPostModal(false);
	};

	const confirmBanUser = async () => {
		const { banUserAuth, banUser, banUserPosts } = banUserId(itinerary.user_id);

		const response = await Promise.all([banUserAuth, banUser, banUserPosts]);

		if (response[0].error || response[1].error || response[2].error) {
			alert("Error occurred while trying to ban user");
			if (response[0].error) console.error(response[0].error);
			if (response[1].error) console.error(response[1].error);
			if (response[2].error) console.error(response[2].error);
		} else {
			alert("User banned for 1 year and all associated posts successfully banned.");
            navigate('/../admin-search');
		}
		setShowBanUserModal(false);
	};

	const createUrl = (events, itinerary) => {
		const sortedEvents = [...events].sort((a, b) => {
			return a.day === b.day ? Date.parse(`0000T${a.time}`) - Date.parse(`0000T${b.time}`) : a.day - b.day;
		});

		const title = itinerary.post_name || itinerary.destination;
		const duration = sortedEvents[sortedEvents.length - 1]?.day - sortedEvents[0]?.day;
		+1;
		const description =
			`<h1>${title}</h1>` +
			`<p>Destination: <b>${itinerary.destination}</b></p>` +
			`<a href=${window.location.href}>View the original post in the Itinerary System</a>\n` +
			"<h2>Itinerary Schedule</h2>" +
			`${sortedEvents.map((e) => `Day ${e.day} @ ${e.time} - ${e.location}`).join("\n")}`;

		const date = new Date();
		const todayFormattedDate = formatDate(date);
		date.setDate(date.getDate() + duration);
		const endFormattedDate = formatDate(date);

		var url =
			"https://calendar.google.com/calendar/u/0/r/eventedit" +
			`?text=${encodeURI(title)}` +
			`&dates=${todayFormattedDate}/${endFormattedDate}` +
			`&location=${itinerary.destination}` +
			`&details=${encodeURI(description)}`;

		return url;
	};

	// formats date in yyyymmdd with leading zeros, for creating Google Calendar url
	const formatDate = (date) => {
		const yyyy = date.getFullYear();
		let mm = date.getMonth() + 1; // Months start at 0!
		let dd = date.getDate();

		if (dd < 10) dd = "0" + dd;
		if (mm < 10) mm = "0" + mm;

		return `${yyyy}${mm}${dd}`;
	};

	const handleSaveItinerary = async () => {
		if (!user) {
			alert("You must be logged in to save an itinerary.");
			return;
		}

		try {
			const { data, error } = await saveItinerary(user.id, postId);
			console.log("Saving itinerary with user ID:", user.id, "and post ID:", postId);

			if (error) {
				console.error("Error saving itinerary:", error.message || error);
				alert("Failed to save itinerary. Please try again.");
			} else {
				alert("Itinerary saved successfully!");
			}
		} catch (err) {
			console.error("Unexpected error:", err);
			alert("An unexpected error occurred while saving the itinerary.");
		}
	};

	return (
		<div className={styles.viewItinerary}>
			<h1>{itinerary.post_name}</h1>
			<ButtonGroup variant="contained" size="large">
				{(!userProfile || userProfile?.role === "traveller") && (
					<>
						<Button onClick={handleSaveItinerary}>Save Itinerary</Button>
					</>
				)}
				<Button component={Link} to={`/comments/${itinerary.post_id}`}>
					Comments
				</Button>
				{(!userProfile || userProfile?.role === "traveller") && (
					<>
						<Button component={Link} to={googleCalendarUrl} rel="noopener" target="_blank">
							Add to Google Calendar <OpenInNewIcon />
						</Button>
						<Button component={Link} to={`/report-form/${itinerary.post_id}`}>
							Report WIP
						</Button>
					</>
				)}
				{userProfile?.role === "admin" && (
					<>
						<Button color="error" onClick={handleBanPost}>
							Ban Post
						</Button>
						<Button color="error" onClick={handleBanUser}>
							Ban Poster
						</Button>
                        <Button color="error" onClick={handleClearReports}>
                            Clear Reports
                        </Button>
					</>
				)}
			</ButtonGroup>
            <span className={styles.postRating}>Rating: {postRating}%</span>
			
			<ButtonGroup>
				<Button variant={myRating?.is_good ? "contained" : "outlined"} onClick={(e) => handleSubmit(e, true)}>
					<ThumbUpIcon />
				</Button>
				<Button
					variant={myRating?.is_good === false ? "contained" : "outlined"}
					onClick={(e) => handleSubmit(e, false)}
				>
					<ThumbDownIcon />
				</Button>
			</ButtonGroup>
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
								<tr key={`${event.post_id}-${event.day}-${event.time}`} className={styles.eventItem}>
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
					<p>
						<strong>Destination:</strong> {itinerary.destination}
					</p>
					<p>
						<strong>Price Range:</strong> ${itinerary.price_low} - ${itinerary.price_high}
					</p>
					<p>
						<strong>Duration:</strong> {itinerary.duration} days
					</p>
					<p>
						<strong>Group Size:</strong> {itinerary.group_size} people
					</p>
					<p>
						<strong>Family Friendly:</strong> {itinerary.is_family_friendly ? "Yes" : "No"}
					</p>
					<p>
						<strong></strong> {itinerary.description}{" "}
					</p>
					<img src={itinerary.image_url} alt={itinerary.post_name} className={styles.itineraryImage} />
				</div>
			) : (
				<p>No itinerary found for this post_id.</p>
			)}
			{showClearReportsModal && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						<h3>Confirm Clear Reports</h3>
						<p>Are you sure you want to delete all reports for this itinerary?</p>
						<div className={styles.modalButtons}>
							<button component={Link} className={styles.confirmButton} onClick={confirmClearReports}>
								Yes
							</button>
							<button className={styles.cancelButton} onClick={() => setShowClearReportsModal(false)}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
            {showBanPostModal && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						<h3>Confirm Ban Post</h3>
						<p>Are you sure you want to ban this itinerary?</p>
						<div className={styles.modalButtons}>
							<button component={Link} className={styles.confirmButton} onClick={confirmBanPost}>
								Yes
							</button>
							<button className={styles.cancelButton} onClick={() => setShowBanPostModal(false)}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
			{showBanUserModal && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						<h3>Confirm Ban User</h3>
						<p>Are you sure you want to ban this user?</p>
						<div className={styles.modalButtons}>
							<button className={styles.confirmButton} onClick={confirmBanUser}>
								Yes
							</button>
							<button className={styles.cancelButton} onClick={() => setShowBanUserModal(false)}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
