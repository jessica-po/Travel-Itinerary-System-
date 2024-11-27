import React, { useEffect, useState } from "react";
import styles from "./AdminSearch.module.css";
import { Link } from "react-router-dom";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import FlagIcon from "@mui/icons-material/Flag";
import useSupabase from "../../context/SupabaseContext";

export default function AdminSearch() {
	const [itineraries, setItineraries] = useState([]);
	const [ratings, setRatings] = useState([]);
	const { getAllItineraries, getPostRatings, getReports, banPost, banUserId } = useSupabase();
	const [reports, setReports] = useState([]);
	const [filters, setFilters] = useState({
		searchQuery: "",
		minDuration: "",
		maxDuration: "",
		minPrice: "",
		maxPrice: "",
		familyFriendly: false,
		showBanned: false,
	});
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showBanModal, setShowBanModal] = useState(false);
	const [selectedItinerary, setSelectedItinerary] = useState(null);

	useEffect(() => {
		document.title = "Admin Search - Travel Itineraries";
		loadItineraries();
	}, []);

	useEffect(() => {
		updateItineraries();
	}, [ratings, reports]);

	const loadItineraries = async () => {
		const { data, error } = await getAllItineraries();
		if (!error) {
			console.log(data);
			setItineraries(data);
			loadRatings();
			loadReports();
		} else {
			alert("Error loading itineraries. Check the console for more details.");
			console.log(error);
		}
	};

	const loadReports = async () => {
		const { data, error } = await getReports();
		if (!error) {
			setReports(data);
		} else {
			alert("Error loading post reports. Check the console for more details.");
			console.log(error);
		}
	};

	const loadRatings = async () => {
		const { data, error } = await getPostRatings();
		if (!error) {
			setRatings(data);
		} else {
			alert("Error loading post ratings. Check the console for more details.");
			console.log(error);
		}
	};

	const addItineraryRatings = () => {
		return itineraries.map((itinerary) => ({
			...itinerary,
			good_count: ratings.find((r) => r.post_id === itinerary.post_id && r.is_good)?.total || 0,
			bad_count: ratings.find((r) => r.post_id === itinerary.post_id && !r.is_good)?.total || 0,
		}));
	};

	const updateItineraries = () => {
		const itinerariesWithRatings = addItineraryRatings(); // Add ratings
		const reportTotals = calculateReportTotals(); // Precompute report counts

		const itinerariesWithReports = itinerariesWithRatings.map((itinerary) => ({
			...itinerary,
			report_count: reportTotals[itinerary.post_id] || 0, // Add reports
		}));

		const sortedItineraries = itinerariesWithReports.sort((a, b) => b.report_count - a.report_count);

		setItineraries(sortedItineraries);
	};

	const handleFilterChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFilters((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const calculateReportTotals = () => {
		return reports.reduce((acc, report) => {
			acc[report.post_id] = (acc[report.post_id] || 0) + 1;
			return acc;
		}, {});
	};

	const handleDeleteItinerary = (postId) => {
		setSelectedItinerary(postId);
		setShowDeleteModal(true);
	};

	const handleBanUser = (userId) => {
		setSelectedItinerary(userId);
		setShowBanModal(true);
	};

	const confirmDeleteItinerary = async () => {
		console.log(`Deleting itinerary with postId: ${selectedItinerary}`);
		const error = await banPost(selectedItinerary);
		if (error) {
			console.error("Error banning itinerary:", error.message);
			alert("Failed to delete itinerary. Please try again.");
		} else {
			alert("Itinerary deleted successfully!");
			setItineraries((prev) => prev.filter((itinerary) => itinerary.post_id !== selectedItinerary));
		}
		setShowDeleteModal(false);
		setSelectedItinerary(null);
	};

	const confirmBanUser = async () => {
		console.log(`Banning user with userId: ${selectedItinerary}`);
		const { banUserAuth, banUser, banUserPosts } = banUserId(selectedItinerary);
		try {
			await banUserAuth;
			const { error: profileError } = await banUser;
			const { error: postsError } = await banUserPosts;

			if (profileError || postsError) {
				throw new Error("Failed to ban user or their posts");
			}

			alert("User and their posts banned successfully!");
			setItineraries((prev) => prev.filter((itinerary) => itinerary.user_id !== selectedItinerary));
		} catch (error) {
			console.error("Error banning user:", error.message);
			alert("Failed to ban user. Please try again.");
		}
		setShowBanModal(false);
		setSelectedItinerary(null);
	};

	const handleViewReports = (postId) => {
		// Logic to view the reports of an itinerary
		console.log(`Viewing reports for postId: ${postId}`);
		// Redirect or open modal to view the reports related to the itinerary
	};

	const filteredItineraries = itineraries.filter((itinerary) => {
		console.log(itinerary.itinerary_status === "banned");
		const matchesStatus = filters.showBanned
			? itinerary.itinerary_status === "banned"
			: itinerary.itinerary_status !== "banned";
		const matchesSearch =
			itinerary.post_name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
			itinerary.destination?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
			itinerary.description?.toLowerCase().includes(filters.searchQuery.toLowerCase());
		const matchesDuration =
			(!filters.minDuration || itinerary.duration >= parseInt(filters.minDuration)) &&
			(!filters.maxDuration || itinerary.duration <= parseInt(filters.maxDuration));
		const matchesPrice =
			(!filters.minPrice || itinerary.price_high >= parseFloat(filters.minPrice)) &&
			(!filters.maxPrice || itinerary.price_low <= parseFloat(filters.maxPrice));
		const matchesFamily = !filters.familyFriendly || itinerary.is_family_friendly;
		const reported = itinerary.report_count > 0;
		return matchesSearch && matchesDuration && matchesPrice && matchesFamily && reported && matchesStatus;
	});

	return (
		<div className={styles.adminSearch}>
			<div className={styles.topBar}>
				<input
					type="text"
					placeholder="Search itineraries..."
					className={styles.searchInput}
					value={filters.searchQuery}
					name="searchQuery"
					onChange={handleFilterChange}
				/>
			</div>
			<div className={styles.mainContent}>
				<div className={styles.sidebar}>
					<div className={styles.filterSection}>
						<h3>Filters</h3>
						<div className={styles.filterGroup}>
							<label>
								Min Duration:
								<input type="number" name="minDuration" value={filters.minDuration} onChange={handleFilterChange} />
							</label>
							<label>
								Max Duration:
								<input type="number" name="maxDuration" value={filters.maxDuration} onChange={handleFilterChange} />
							</label>
							<label>
								Min Price:
								<input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} />
							</label>
							<label>
								Max Price:
								<input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} />
							</label>
							<label>
								Family Friendly:
								<input
									type="checkbox"
									name="familyFriendly"
									checked={filters.familyFriendly}
									onChange={handleFilterChange}
								/>
							</label>
							<label>
								Show Banned Itineraries:
								<input type="checkbox" name="showBanned" checked={filters.showBanned} onChange={handleFilterChange} />
							</label>
						</div>
					</div>
				</div>
				<div className={styles.itineraryContent}>
					<div className={styles.itineraryList}>
						{filteredItineraries.map((itinerary) => (
							<div key={itinerary.post_id} className={styles.itineraryCard}>
								{itinerary.itinerary_status === "banned" && <div className={styles.bannedBadge}>Banned</div>}
								<Link to={`/view-itinerary/${itinerary.post_id}`} className={styles.itineraryLink}>
									<img src={itinerary.image_url} alt={itinerary.post_name} className={styles.itineraryImage} />
									<div className={styles.itineraryInfo}>
										<h3>{itinerary.post_name}</h3>
										<div className={styles.destination}>{itinerary.destination}</div>
										<div className={styles.description}>
											{itinerary.description?.length > 200
												? `${itinerary.description.substring(0, 200)}...`
												: itinerary.description}
										</div>

										<div className={styles.details}>
											<span>Duration: {itinerary.duration} days</span>
											<span>
												Price Range: ${itinerary.price_low} - ${itinerary.price_high}
											</span>
											<span>{itinerary.is_family_friendly ? "Family Friendly" : "Not Family Friendly"}</span>
										</div>

										<td>
											{itinerary.good_count + itinerary.bad_count > 0 ? (
												<div className={styles.ratingContainer}>
													<ThumbUpIcon className={styles.ratingIcon} />
													<span className={styles.rating}>
														{Math.round((itinerary.good_count / (itinerary.good_count + itinerary.bad_count)) * 100)}%
													</span>
													<span className={styles.ratingCount}>
														{itinerary.good_count + itinerary.bad_count} rating
														{itinerary.good_count + itinerary.bad_count !== 1 && "s"}
													</span>
												</div>
											) : (
												<span className={styles.ratingContainer}> No Ratings </span>
											)}
											{itinerary.report_count > 0 ? (
												<div className={styles.ratingContainer}>
													<div>
														<FlagIcon className={styles.reportIcon} />
														<span className={styles.rating}>{itinerary.report_count}</span>
													</div>
												</div>
											) : (
												<span className={styles.ratingContainer}> No Reports </span>
											)}
										</td>
									</div>
								</Link>
								<div className={styles.adminButtons}>
									<button className={styles.adminButton} onClick={() => handleDeleteItinerary(itinerary.post_id)}>
										Delete Itinerary
									</button>
									<button className={styles.adminButton} onClick={() => handleBanUser(itinerary.user_id)}>
										Ban User
									</button>
									<button className={styles.adminButton} onClick={() => handleViewReports(itinerary.post_id)}>
										View Reports
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
				{showDeleteModal && (
					<div className={styles.modalOverlay}>
						<div className={styles.modalContent}>
							<h3>Confirm Delete</h3>
							<p>Are you sure you want to delete this itinerary?</p>
							<div className={styles.modalButtons}>
								<button className={styles.confirmButton} onClick={confirmDeleteItinerary}>
									Yes
								</button>
								<button className={styles.cancelButton} onClick={() => setShowDeleteModal(false)}>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}

				{showBanModal && (
					<div className={styles.modalOverlay}>
						<div className={styles.modalContent}>
							<h3>Confirm Ban</h3>
							<p>Are you sure you want to ban this user?</p>
							<div className={styles.modalButtons}>
								<button className={styles.confirmButton} onClick={confirmBanUser}>
									Yes
								</button>
								<button className={styles.cancelButton} onClick={() => setShowBanModal(false)}>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
