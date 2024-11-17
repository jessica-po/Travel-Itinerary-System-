import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styles from './Comments.module.css';

export default function Comments() {
    const { postId } = useParams();
    
    useEffect(() => {
        document.title = "Comments - Travel Itineraries";
    });

    return (
        <div className="comments">
            <h2>Comments Page</h2>
            <Link to={`/view-itinerary/${postId}`}>
                <button>
                    Back
                </button>
            </Link>
        </div>
    );
}
