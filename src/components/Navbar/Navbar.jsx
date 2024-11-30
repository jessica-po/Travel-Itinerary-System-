import { NavLink, useNavigate } from "react-router-dom";
import useSupabase from "../../context/SupabaseContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
	const { user, userProfile, logout } = useSupabase();

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	return (
		<>
			<div className={styles.navbar}>
				<nav>
					<ul className={styles["nav-links"]}>
						{/* <img src="" alt="" className=[styles.logo}/> - logo placeholder */}
						<li className={`${styles["nav-item-container"]} ${styles["no-hover"]}`}>
							<NavLink to="/" className={styles["nav-item"]}>
								<h1 className={styles.logo}>Travel Itineraries</h1>
							</NavLink>
						</li>

						{user && (
							<>
								<li className={styles["nav-item-container"]}>
									<NavLink to="/saved-itineraries" className={styles["nav-item"]}>
										Saved Itineraries
									</NavLink>
								</li>
								{userProfile?.role === "admin" && (
									<li className={styles["nav-item-container"]}>
										<NavLink to="/admin-search" className={styles["nav-item"]}>
											Admin Search
										</NavLink>
									</li>
								)}
								<li className={styles["nav-item-container"]}>
									<NavLink to="/my-itineraries" className={styles["nav-item"]}>
										My Itineraries
									</NavLink>
								</li>
								<li className={styles["nav-item-container"]}>
									<NavLink to="/account" className={styles["nav-item"]}>
										My Account
									</NavLink>
								</li>
								<li className={`${styles["nav-item-container"]} ${styles["no-hover"]}`}>
									<button className={styles["logout-button"]} onClick={handleLogout}>
										Log Out
									</button>
								</li>
							</>
						)}
						{!user && (
							<>
								<li className={styles["nav-item-container"]}>
									<NavLink to="/login" className={styles["nav-item"]}>
										Login
									</NavLink>
								</li>
							</>
						)}
						<li className={styles["nav-item-container"]}>
							<NavLink to="/search-itinerary" className={styles["nav-item"]}>
								Find Itineraries
							</NavLink>
						</li>
					</ul>
				</nav>
			</div>
		</>
	);
}
