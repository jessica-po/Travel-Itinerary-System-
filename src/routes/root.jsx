import { Link, NavLink, Outlet } from "react-router-dom";
import styles from './root.module.css';
import useAuth from "../hooks/useDatabase";


export default function Root() {
    return (
        <>
            <div className={styles["root-layout"]}>
                <div className={styles.container}>
                    <div className={styles.navbar}>
                        <nav>
                            <ul className={styles["nav-links"]}>
                                <li>
                                    {/* <img src="" alt="" className=[styles.logo}/> - logo placeholder */}
                                    <NavLink to="/" className={styles["nav-item"]}>
                                        <h1 className={styles.logo}>Travel Itinerary</h1>
                                    </NavLink>
                                </li>
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
                                    <NavLink to="/register" className={styles["nav-item"]}>
                                        Register
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/login" className={styles["nav-item"]}>
                                        Login
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/search-itinerary" className={styles["nav-item"]}>
                                        Find Itineraries
                                    </NavLink>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <main className={styles.main}>
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}
