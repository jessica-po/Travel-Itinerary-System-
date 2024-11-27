import React, { useEffect, useState } from "react";
import styles from './AdminSearch.module.css';
import { Link } from "react-router-dom";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FlagIcon from '@mui/icons-material/Flag';
import useSupabase from "../../context/SupabaseContext";

export default function AdminSearch() {
	const [ itineraries, setItineraries ] = useState([]);
	const [ ratings, setRatings ] = useState([]);
	const { getItineraries, getPostRatings, getReports } = useSupabase();
	const [ reports, setReports ] = useState([]);
	const [filters, setFilters] = useState({
		searchQuery: "",
		minDuration: "",
		maxDuration: "",
		minPrice: "",
		maxPrice: "",
		familyFriendly: false,
	});

	useEffect(() => {
		document.title = "Admin Search - Travel Itineraries";
		loadItineraries();
	}, []);

	useEffect(() => {
		updateItineraries();
	}, [ratings, reports]);

	const loadItineraries = async () => {
        const { data, error } = await getItineraries();
        if (!error) {
            setItineraries(data);
            loadRatings();
			loadReports();
        } else {
            alert("Error loading itineraries. Check the console for more details.")
            console.log(error);
        }
    };

	const loadReports = async () => {
        const { data, error } = await getReports();
        if (!error) {
            setReports(data);
        } else {
            alert("Error loading post reports. Check the console for more details.")
            console.log(error);
        }
    }

	const loadRatings = async () => {
        const { data, error } = await getPostRatings();
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

	const updateItineraries = () => {
		const itinerariesWithRatings = addItineraryRatings(); // Add ratings
		const reportTotals = calculateReportTotals(); // Precompute report counts
	
		const itinerariesWithReports = itinerariesWithRatings.map(itinerary => ({
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
	
	

	const filteredItineraries = itineraries.filter((itinerary) => {
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
		return matchesSearch && matchesDuration && matchesPrice && matchesFamily && reported;
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
							</div>
						</div>
					</div>
					<div className={styles.itineraryContent}>
						<div className={styles.itineraryList}>
							{filteredItineraries.map((itinerary) => (
								<Link to={`/view-itinerary/${itinerary.post_id}`}>
									<div key={itinerary.post_id} className={styles.itineraryCard}>
										<img src={itinerary.image_url} alt={itinerary.post_name} className={styles.itineraryImage} />
										<div className={styles.itineraryInfo}>
											<h3>{itinerary.post_name}</h3>
											<div className={styles.destination}>{itinerary.destination}</div>
											<div className={styles.description}>{itinerary.description}</div>
			
											<div className={styles.details}>
												<span>Duration: {itinerary.duration} days</span>
												<span>
													Price Range: ${itinerary.price_low} - ${itinerary.price_high}
												</span>
												<span>{itinerary.is_family_friendly ? "Family Friendly" : "Not Family Friendly"}</span>
												
											</div>

											<td>
												{ itinerary.good_count + itinerary.bad_count > 0 ? 
												<div className={styles.ratingContainer}>
													<ThumbUpIcon className={styles.ratingIcon} />
													<span className={styles.rating}>
														{Math.round(itinerary.good_count / (itinerary.good_count + itinerary.bad_count) * 100)}%
													</span>
													<span className={styles.ratingCount}>
														{itinerary.good_count + itinerary.bad_count} rating{itinerary.good_count + itinerary.bad_count !== 1 && "s"}
													</span>
												</div> : <>
												<span className={styles.ratingContainer}>  No Ratings </span>
												</>}
												{ itinerary.report_count > 0 ? 
												<div className={styles.ratingContainer}>
													<div>
														<FlagIcon className={styles.reportIcon} />
														<span className={styles.rating}>
															{itinerary.report_count}
														</span>
													</div>
												</div> : <>
													<span className={styles.ratingContainer}>  No Reports </span>
													
												</>}
											</td>
											
											
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
	);
}
