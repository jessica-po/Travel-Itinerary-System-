import { NavLink, useNavigate } from "react-router-dom";
import useSupabase from "../../context/SupabaseContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const { user, logout } = useSupabase();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error); 
        }
    };

    return (<>    
        <div className={styles.navbar}>
            <nav>
                <ul className={styles["nav-links"]}>
                    <li>
                        {/* <img src="" alt="" className=[styles.logo}/> - logo placeholder */}
                        <NavLink to="/" className={styles["nav-item"]}>
                            <h1 className={styles.logo}>Travel Itinerary</h1>
                        </NavLink>
                    </li>
                    {
                        user && <>
                            <li>
                                <NavLink to="/saved-itineraries" className={styles["nav-item"]}>
                                    Saved Itineraries
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin-search" className={styles["nav-item"]}>
                                    Admin Search
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/my-itineraries" className={styles["nav-item"]}>
                                    My Itineraries
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/account" className={styles["nav-item"]}>
                                    My Account
                                </NavLink>
                            </li>
                            <li>
                                    <button className="logout"
                                        onClick={handleLogout}>
                                        Log Out
                                    </button>
                                </li>
                        </>
                    }
                    {
                        !user && <>
                            <li>
                                <NavLink to="/login" className={styles["nav-item"]}>
                                    Login
                                </NavLink>
                            </li>
                        </>
                    }
                    <li>
                        <NavLink to="/search-itinerary" className={styles["nav-item"]}>
                            Find Itineraries
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    </>)
}