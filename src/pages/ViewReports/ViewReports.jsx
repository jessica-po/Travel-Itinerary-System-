import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useSupabase from "../../context/SupabaseContext";
import styles from "./ViewReports.module.css";
import { Button } from "@mui/material";

export default function ViewReports() {
	const params = useParams();
	const { postId } = params;

	const { getDetailedReports, deleteReport } = useSupabase();
	const [reports, setReports] = useState([]);
	const [postTitle, setPostTitle] = useState(""); // Add state for post title
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false); // Move state inside the component
	const [selectedReportId, setSelectedReportId] = useState(null); // Move state inside the component

	useEffect(() => {
		if (!postId || postId === "undefined") {
			console.error("Invalid post ID:", postId);
			setError("Invalid post ID.");
			setLoading(false);
			return;
		}

		const loadReports = async () => {
			try {
				const { data: reportsData, error: reportsError } = await getDetailedReports(postId);
				if (reportsError) {
					throw new Error(reportsError.message);
				}

				if (reportsData.length > 0) {
					setPostTitle(reportsData[0].post_name || "Unknown Title"); // Set post title
				}

				setReports(reportsData);
			} catch (err) {
				console.error("Error loading reports:", err);
				setError("Failed to load reports. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		loadReports();
	}, [postId, getDetailedReports]);

	const handleDeleteReport = (postId, userId) => {
		setSelectedReportId({ postId, userId });
		setShowDeleteModal(true);
	};

	const confirmDeleteReport = async () => {
		if (!selectedReportId) return;

		try {
			const { error } = await deleteReport(selectedReportId.postId, selectedReportId.userId);
			if (error) {
				throw new Error(error.message);
			}
			setReports((prevReports) =>
				prevReports.filter(
					(report) => !(report.post_id === selectedReportId.postId && report.user_id === selectedReportId.userId)
				)
			);
			alert("Report deleted successfully!");
		} catch (err) {
			console.error("Error deleting report:", err);
			alert("Failed to delete the report. Please try again.");
		} finally {
			setShowDeleteModal(false);
		}
	};

	if (loading) {
		return <div className={styles.loading}>Loading reports...</div>;
	}

	if (error) {
		return <div className={styles.error}>{error}</div>;
	}

	return (
		<div className={styles.viewReports}>
			<Button component={Link} to="/admin-search" variant="contained" color="secondary" size="small">
				&lt; Back to Reported Itineraries
			</Button>
			<h2>{`Reports for Post: ${postTitle}`}</h2>
			<p className={styles.postId}>{`Post ID: ${postId}`}</p>
			<div className={styles.reportList}>
				{reports.length > 0 ? (
					reports.map((report) => (
						<div key={`${report.post_id}-${report.user_id}`} className={styles.reportCard}>
							<div className={styles.reportInfo}>
								<strong>Reported By:</strong> {report.user_name}
							</div>
							<div className={styles.reportInfo}>
								<strong>Report Date:</strong> {new Date(report.report_date).toLocaleString()}
							</div>
							<div className={styles.reportReason}>
								<strong>Reason:</strong> {report.reason}
							</div>
							<button
								className={styles.deleteReportButton}
								onClick={() => handleDeleteReport(report.post_id, report.user_id)}
							>
								Delete Report
							</button>
						</div>
					))
				) : (
					<div>No reports found for this post.</div>
				)}
			</div>

			{showDeleteModal && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						<h3>Confirm Delete</h3>
						<p>Are you sure you want to delete this report?</p>
						<div className={styles.modalButtons}>
							<button className={styles.confirmButton} onClick={confirmDeleteReport}>
								Yes
							</button>
							<button className={styles.cancelButton} onClick={() => setShowDeleteModal(false)}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
