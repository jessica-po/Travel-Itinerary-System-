import React, { useEffect, useState } from "react";
import styles from "./AdminSearch.module.css";
import { Link } from "react-router-dom";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import FlagIcon from "@mui/icons-material/Flag";
import useSupabase from "../../context/SupabaseContext";

export default function AdminSearch() {
	const [itineraries, setItineraries] = useState([]);
	const [ratings, setRatings] = useState([]);
	const {
		getAllItineraries,
		getPostRatings,
		getReports,
		clearReports,
		banPost,
		banUserId,
		unbanPost,
		unbanUserId,
		getUserProfiles,
	} = useSupabase();
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
	const [showClearReportsModal, setShowClearReportsModal] = useState(false);
	const [showUnbanUserModal, setShowUnbanUserModal] = useState(false);
	const [showUnbanPostModal, setShowUnbanPostModal] = useState(false);

	useEffect(() => {
		document.title = "Admin Search - Travel Itineraries";
		loadItineraries();
	}, []);

	useEffect(() => {
		updateItineraries();
	}, [ratings, reports]);

	const loadItineraries = async () => {
		const { data: itinerariesData, error: itinerariesError } = await getAllItineraries();

		if (itinerariesError) {
			alert("Error loading itineraries. Check the console for more details.");
			console.error(itinerariesError);
			return;
		}

		// Fetch user profiles for all users that have itineraries
		const userIds = [...new Set(itinerariesData.map((itinerary) => itinerary.user_id))];
		const { data: userProfiles, error: userProfilesError } = await getUserProfiles(userIds);

		if (userProfilesError) {
			alert("Error loading user profiles. Check the console for more details.");
			console.error(userProfilesError);
			return;
		}

		// Merge user profile status into itineraries
		const enrichedItineraries = itinerariesData.map((itinerary) => {
			const userProfile = userProfiles.find((profile) => profile.user_id === itinerary.user_id);
			return {
				...itinerary,
				user_status: userProfile ? userProfile.profile_status : "normal",
			};
		});

		setItineraries(enrichedItineraries);
		loadRatings();
		loadReports();
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

	const handleUnbanUser = (userId) => {
		setSelectedItinerary(userId);
		setShowUnbanUserModal(true);
	};

	const handleClearReports = (postId) => {
		setSelectedItinerary(postId);
		setShowClearReportsModal(true);
	};

	const handleUnbanPost = (postId) => {
		setSelectedItinerary(postId);
		setShowUnbanPostModal(true);
	};

	const confirmClearReports = async () => {
		console.log(`Deleting Reports with postId: ${selectedItinerary}`);
		const error = await clearReports(selectedItinerary);
		if (error) {
			console.error("Error clearing reports: ", error.message);
			alert("Failed to delete reports. Please try again.");
		} else {
			alert("Reports deleted successfully!");
			setItineraries((prev) => prev.filter((itinerary) => itinerary.post_id !== selectedItinerary));
		}
		setShowClearReportsModal(false);
		setSelectedItinerary(null);
		loadItineraries();
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
		loadItineraries();
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
		loadItineraries();
	};

	const confirmUnbanUser = async () => {
		try {
			const error = await unbanUserId(selectedItinerary);
			if (error) {
				console.error("Error unbanning user:", error.message);
				alert("Failed to unban user. Please try again.");
			} else {
				alert("User unbanned successfully!");
			}
		} catch (error) {
			console.error("Error unbanning user:", error);
			alert("Failed to unban user. Please try again.");
		}
		setShowUnbanUserModal(false);
		setSelectedItinerary(null);
		loadItineraries();
	};

	const confirmUnbanPost = async () => {
		try {
			const error = await unbanPost(selectedItinerary);
			if (error) {
				console.error("Error unbanning post:", error.message);
				alert("Failed to unban post. Please try again.");
			} else {
				alert("Post unbanned successfully!");
			}
		} catch (error) {
			console.error("Error unbanning post:", error);
			alert("Failed to unban post. Please try again.");
		}
		setShowUnbanPostModal(false);
		setSelectedItinerary(null);
		loadItineraries();
	};

	const filteredItineraries = itineraries.filter((itinerary) => {
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
									{itinerary.itinerary_status === "banned" ? (
										<button className={styles.adminButton} onClick={() => handleUnbanPost(itinerary.post_id)}>
											Unban Post
										</button>
									) : (
										<button className={styles.adminButton} onClick={() => handleDeleteItinerary(itinerary.post_id)}>
											Ban Post
										</button>
									)}

									{itinerary.user_status === "banned" ? (
										<button className={styles.adminButton} onClick={() => handleUnbanUser(itinerary.user_id)}>
											Unban User
										</button>
									) : (
										<button className={styles.adminButton} onClick={() => handleBanUser(itinerary.user_id)}>
											Ban User
										</button>
									)}
									<Link to={`/view-reports/${itinerary.post_id}`} className={styles.buttonLink}>
										<button className={styles.adminButton}>View Reports</button>
									</Link>
									<button className={styles.adminButton} onClick={() => handleClearReports(itinerary.post_id)}>
										Clear Reports
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
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
				{showUnbanUserModal && (
					<div className={styles.modalOverlay}>
						<div className={styles.modalContent}>
							<h3>Confirm Unban User</h3>
							<p>Are you sure you want to unban this user?</p>
							<div className={styles.modalButtons}>
								<button className={styles.confirmButton} onClick={confirmUnbanUser}>
									Yes
								</button>
								<button className={styles.cancelButton} onClick={() => setShowUnbanUserModal(false)}>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}
				{showUnbanPostModal && (
					<div className={styles.modalOverlay}>
						<div className={styles.modalContent}>
							<h3>Confirm Unban Post</h3>
							<p>Are you sure you want to unban this post?</p>
							<div className={styles.modalButtons}>
								<button className={styles.confirmButton} onClick={confirmUnbanPost}>
									Yes
								</button>
								<button className={styles.cancelButton} onClick={() => setShowUnbanPostModal(false)}>
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
