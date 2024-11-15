import React, { useEffect, useState } from "react";
import styles from "./SearchItinerary.module.css";
import useAuth from "../../hooks/useDatabase";

export default function SearchItinerary() {
	const [itineraries, setItineraries] = useState([]);
	const { getItineraries } = useAuth();
	const [filters, setFilters] = useState({
		searchQuery: "",
		minDuration: "",
		maxDuration: "",
		minPrice: "",
		maxPrice: "",
		familyFriendly: false,
	});

	useEffect(() => {
		document.title = "Find Itineraries - Travel Itineraries";
		loadItineraries();
	}, []);

	const loadItineraries = async () => {
		const { data, error } = await getItineraries();
		if (!error) {
			setItineraries(data);
		}
	};

	const handleFilterChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFilters((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
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
		return matchesSearch && matchesDuration && matchesPrice && matchesFamily;
	});

	return (
		<div className={styles.searchItinerary}>
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
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
