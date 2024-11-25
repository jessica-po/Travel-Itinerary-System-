import { Outlet } from "react-router-dom";
import styles from './root.module.css';
import Navbar from "../components/Navbar/Navbar";



export default function Root() {
    return (
        <>
            <div className={styles["root-layout"]}>
                <div className={styles.container}>
                    <Navbar />
                    <main className={styles.main}>
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}

