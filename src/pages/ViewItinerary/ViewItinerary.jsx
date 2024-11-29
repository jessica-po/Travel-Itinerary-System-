import { Link, useParams } from "react-router-dom";
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
		getEvents,
		getRatings,
		upsertRating,
		insertReport,
		insertRating,
		user,
		userProfile,
		banPost,
		banUserId,
		saveItinerary,
		getReports,
	} = useSupabase();
	const [filteredEvents, setFilteredEvents] = useState([]);
	const [itinerary, setItinerary] = useState({});
	const [myRating, setMyRating] = useState([]);
	const [showReportModal, setShowReportModal] = useState(false);
	const [reportReason, setReportReason] = useState("");
	// const [userId, setUserId] = useState(null);
	//const [myRateIsGood, setMyRateIsGood] = useState(false);
	const [googleCalendarUrl, setGoogleCalendarUrl] = useState("https://calendar.google.com/calendar/u/0/r/eventedit");
	const [showBanPostModal, setShowBanPostModal] = useState(false);
	const [showBanUserModal, setShowBanUserModal] = useState(false);

	useEffect(() => {
		document.title = "View Itinerary - Travel Itineraries";
		if (postId) {
			loadEvents();
			loadItineraries();
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

	const loadMyRating = async () => {
		const { data, error } = await getRatings();
		if (!error) {
			const matchedRating = data.find((rating) => rating.user_id === user.id);
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

		setMyRating({ ...myRating, is_good: myRateIsGood });

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

	const confirmBanPost = async () => {
		const error = await banPost(itinerary.post_id);

		if (error) {
			alert(error.message);
			console.error(error);
		} else {
			alert("Itinerary has been banned.");
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

	const handleReportClick = () => {
		setShowReportModal(true);
	};

	const handleCloseReportModal = () => {
		setShowReportModal(false);
		setReportReason("");
	};

	const handleSubmitReport = async () => {
		if (!user || !postId) {
			alert("You must be logged in to report an itinerary.");
			return;
		}

		if (!reportReason) {
			alert("Please provide a reason for the report.");
			return;
		}

		try {
			// Check if the report already exists
			const { data: existingReports, error: reportError } = await getReports();
			if (reportError) {
				console.error("Error fetching reports:", reportError);
				alert("Failed to check existing reports. Please try again.");
				return;
			}

			// If a report already exists for this post by this user, show an error
			const duplicateReport = existingReports.find((report) => report.post_id === postId && report.user_id === user.id);
			if (duplicateReport) {
				alert("You have already reported this itinerary.");
				return;
			}

			// Proceed with inserting the report
			const { error } = await insertReport({
				post_id: postId,
				user_id: user.id,
				reason: reportReason,
			});

			if (error) {
				console.error("Error submitting report:", error);
				alert("Failed to submit the report. Please try again.");
			} else {
				alert("Report submitted successfully.");
				setShowReportModal(false);
				setReportReason(""); // Clear the input after successful submission
			}
		} catch (err) {
			console.error("Error submitting report:", err);
			alert("An unexpected error occurred. Please try again.");
		}
	};

	return (
		<>
			<div className={styles.viewItinerary}>
				<div className={styles.buttonGroupContainer}>
					<div className={styles.leftButtonGroup}>
						{(!userProfile || userProfile?.role === "traveller") && (
							<Button onClick={handleSaveItinerary}>Save Itinerary</Button>
						)}
						<Button component={Link} to={googleCalendarUrl} rel="noopener" target="_blank">
							Add to Google Calendar <OpenInNewIcon />
						</Button>
					</div>
					<div className={styles.rightButtonGroup}>
						{userProfile?.role === "admin" && (
							<>
								<Button color="error" onClick={handleBanPost}>
									Ban Post
								</Button>
								<Button color="error" onClick={handleBanUser}>
									Ban Poster
								</Button>
							</>
						)}
						{(!userProfile || userProfile?.role === "traveller") && (
							<>
								<Button component={Link} onClick={handleReportClick}>
									Report
								</Button>
								<Button component={Link} to={`/comments/${itinerary.post_id}`}>
									Comments
								</Button>
							</>
						)}
					</div>
				</div>

				<div className={styles.itineraryDetailsContainer}>
					<div className={styles.itineraryImageContainer}>
						<img src={itinerary.image_url} alt={itinerary.post_name} className={styles.itineraryImage} />
					</div>
					<div className={styles.itineraryDetails}>
						<h1 className={styles.title}>{itinerary.post_name}</h1>
						<div className={styles.ratingContainer}>
							<strong>Rating: </strong>{" "}
							{myRating?.is_good !== undefined ? `${myRating.is_good ? "100%" : "0%"}` : "__%"}
							<ButtonGroup className={styles.ratingButtonGroup}>
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
						</div>
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
							<strong>Description:</strong> {itinerary.description}
						</p>
					</div>
				</div>

				<div className={styles.eventsContainer}>
					<h2>Events</h2>
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
								<tr>
									<td colSpan="3">No events.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
			{showReportModal && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						<h3>Report Itinerary</h3>
						<textarea
							value={reportReason}
							onChange={(e) => setReportReason(e.target.value)}
							className={styles.modalInput}
							placeholder="Enter reason for report"
						/>

						<div className={styles.modalButtons}>
							<button className={styles.confirmButton} onClick={handleSubmitReport}>
								Submit
							</button>
							<button className={styles.cancelButton} onClick={handleCloseReportModal}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
