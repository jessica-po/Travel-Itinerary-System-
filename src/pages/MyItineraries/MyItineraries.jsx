import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./MyItineraries.module.css";
import useSupabase from "../../context/SupabaseContext";
import DeleteIcon from "@mui/icons-material/Delete";


export default function MyItineraries() {
	const [itineraries, setItineraries] = useState([]);
	// const [userId, setUserId] = useState(null);
	const { getUserItineraries, user, deleteItinerary } = useSupabase();
	const [filters, setFilters] = useState({
		searchQuery: "",
		minDuration: "",
		maxDuration: "",
		minPrice: "",
		maxPrice: "",
		familyFriendly: false,
	});
	const navigate = useNavigate();

	// Fetch logged-in user and set userId
	// useEffect(() => {
	//   const fetchUser = async () => {
	//     const { user, error } = await getLoggedInUser();
	//     if (error || !user) {
	//       console.error("Error fetching user:", error);
	//       alert("Please log in to view your itineraries.");
	//       navigate("/login");
	//     } else {
	//       setUserId(user.id); // Set the logged-in user's ID
	//     }
	//   };
	//   fetchUser();
	// }, [getLoggedInUser, navigate]);

	// Load itineraries for the logged-in user
	useEffect(() => {
		if (!user.id) return; // Don't fetch itineraries until userId is set
		const loadUserItineraries = async () => {
			const { data, error } = await getUserItineraries(user.id);
			if (!error) {
				setItineraries(data); // Set the itineraries for the user
			} else {
				console.error("Failed to fetch user itineraries:", error);
			}
		};
		loadUserItineraries();
	}, [user, getUserItineraries]);



	// Function to handle navigation to the form page
	const handleCreateItinerary = () => {
		navigate("/create-itinerary");
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

	// Render based on user status
	if (user.id === null) {
		return <div>Loading...</div>;
	};


  const handleDeleteItinerary = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const itinerary = itineraries.find((itin) => itin.post_id === postId);

    if (!itinerary) {
        alert("Itinerary not found.");
        return;
    }

    // Verify if the user is the owner of the itinerary
    if (itinerary.user_id !== user.id) {
        alert("You are not authorized to delete this itinerary.");
        return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this itinerary?");
    if (!confirmed) return;

    try {
        const { error } = await deleteItinerary(user.id, postId); // Call the deleteItinerary function from context
        if (!error) {
            setItineraries((prev) => prev.filter((itin) => itin.post_id !== postId));
            alert("Itinerary deleted successfully.");
        } else {
            console.error("Failed to delete itinerary:", error);
            alert("Failed to delete itinerary.");
        }
    } catch (err) {
        console.error("Error deleting itinerary:", err);
        alert("An unexpected error occurred.");
    }
};


	return (
    <div className="my-itineraries">
      <h2>My Itineraries (Page)</h2>
      <div className={styles.topBar}>
        <button onClick={handleCreateItinerary} className={styles.createButton}>
          Create New Itinerary
        </button>
        <input
          type="text"
          placeholder="Search My Itineraries..."
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
                <input
                  type="number"
                  name="minDuration"
                  value={filters.minDuration}
                  onChange={handleFilterChange}
                />
              </label>
              <label>
                Max Duration:
                <input
                  type="number"
                  name="maxDuration"
                  value={filters.maxDuration}
                  onChange={handleFilterChange}
                />
              </label>
              <label>
                Min Price:
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
              </label>
              <label>
                Max Price:
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
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
              <Link
                key={itinerary.post_id}
                to={`/view-itinerary/${itinerary.post_id}`}
              >
                <div className={styles.itineraryCard}>
                  <img
                    src={itinerary.image_url}
                    alt={itinerary.post_name}
                    className={styles.itineraryImage}
                  />
                  <div className={styles.itineraryInfo}>
                    <h3>{itinerary.post_name}</h3>
                    <div className={styles.destination}>
                      {itinerary.destination}
                    </div>
                    <div className={styles.description}>
                      {itinerary.description?.length > 200
                        ? `${itinerary.description.substring(0, 200)}...`
                        : itinerary.description}
                    </div>
                    <div className={styles.details}>
                      <span>Duration: {itinerary.duration} days</span>
                      <span>
                        Price Range: ${itinerary.price_low} - $
                        {itinerary.price_high}
                      </span>
                      <span>
                        {itinerary.is_family_friendly
                          ? "Family Friendly"
                          : "Not Family Friendly"}
                      </span>
                    </div>
                  </div>
                  <DeleteIcon
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteItinerary(itinerary.post_id, e)}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
