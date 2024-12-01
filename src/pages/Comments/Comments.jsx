import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import styles from "./Comments.module.css";
import useSupabase from "../../context/SupabaseContext";

export default function Comments() {
    const { postId } = useParams();
    const { getComments, addComment, deleteComment, user } = useSupabase();

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [modalOpen, setModalOpen] = useState(false); // Modal state
    const [commentToDelete, setCommentToDelete] = useState(null); // Track which comment to delete

    useEffect(() => {
        document.title = "Comments - Travel Itineraries";
        fetchComments();
    }, []);

    const fetchComments = async () => {
        const { data, error } = await getComments(postId);
        if (!error) {
            setComments(data);
        } else {
            console.error("Error fetching comments:", error);
        }
    };

    const handleAddComment = async () => {
		if (!user) {
			alert("You must be logged in to comment.");
			return;
		}
        if (!newComment.trim()) {
            alert("Comment cannot be empty.");
            return;
        }

        const { data, error } = await addComment({
            post_id: postId,
            user_id: user.id,
            comment: newComment,
            first_name: user.user_metadata.first_name,
            last_name: user.user_metadata.last_name,
        });

        if (!error) {
            setComments((prev) => [...data, ...prev]);
            setNewComment("");
        } else {
            console.error("Error adding comment:", error);
        }
    };

    const openDeleteModal = (commentId) => {
        setCommentToDelete(commentId); // Set the comment to delete
        setModalOpen(true); // Open the modal
    };

    const cancelDelete = () => {
        setCommentToDelete(null); // Clear the comment to delete
        setModalOpen(false); // Close the modal
    };

    const confirmDelete = async () => {
        if (!commentToDelete) return;

        const { error } = await deleteComment(commentToDelete); // Delete the specific comment
        if (!error) {
            setComments((prev) => prev.filter((comment) => comment.comment_id !== commentToDelete)); // Remove the comment from the list
        } else {
            console.error("Error deleting comment:", error);
        }

        // Close the modal after deletion
        cancelDelete();
    };

    return (
        <div className="comments">
            <h2>Comments</h2>
            <Link to={`/view-itinerary/${postId}`}>
                <button className={styles.backButton}>Back</button>
            </Link>

            <div className={styles.commentForm}>
                <textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button className={styles.postComment} onClick={handleAddComment}>Post Comment</button>
            </div>

            <div className={styles.commentsList}>
                {comments.length === 0 ? (
                    <div className={styles.noComments}>
                        Looks like there's no comments on this itinerary. Be the first to comment!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.comment_id} className={styles.comment}>
                            <div className={styles.commentHeader}>
                                <span>
                                    {comment.first_name} {comment.last_name}
                                </span>
                                {comment.user_id === user?.id && (
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => openDeleteModal(comment.comment_id)} 
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <p>{comment.comment}</p>
                            <span className={styles.commentDate}>
                                {new Date(comment.created_at).toLocaleString()}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Modal for Delete Confirmation */}
            <Dialog open={modalOpen} onClose={cancelDelete}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this comment?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete}>Cancel</Button>
                    <Button
                        onClick={confirmDelete}
                        style={{ backgroundColor: "#D11A2A", color: "white" }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
