import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styles from './ReportForm.module.css';

export default function Comments() {
    const { postId } = useParams();
    
    useEffect(() => {
        document.title = "Report Form - Travel Itineraries";
    });

    return (
        <div className="Report">
            <h2>Report Form Page</h2>
            <Link to={`/view-itinerary/${postId}`}>
                <button>
                    Back
                </button>
            </Link>
        </div>
    );
}
