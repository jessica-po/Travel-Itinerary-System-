import {
	AuthError,
	createClient,
	PostgrestError,
	Session,
	SupabaseClient,
	User,
	WeakPassword,
} from "@supabase/supabase-js";
import React, { createContext, useContext, useState } from "react";
import { publicAnonKey, url } from "../../supabase.token";
import { service_role_key } from "../../supabase.admin.token";
import { Database } from "../../database.types";
import { StorageError } from "@supabase/storage-js";

export const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function SupabaseContextProvider({ children }) {
	const [supabase, _] = useState(createClient<Database>(url, service_role_key || publicAnonKey));
	const [user, setUser] = useState<User | null>(null);
	const [userProfile, setUserProfile] = useState<Database["public"]["Tables"]["profile"]["Row"] | null>(null);

	const setLoggedIn = async (user: User | null) => {
		setUser(user);

		if (user === null) {
			setUserProfile(null);
		} else {
			const { data, error } = await getUserProfile(user.id);

			if (!error) {
				setUserProfile(data);
			}
		}
	};

	const register = async (user: RegisterDetails) => {
		const { data, error } = await supabase.auth.signUp(user);
		if (!error) {
			await setLoggedIn(data.user);
		}
		return { data, error };
	};

	const login = async (user: LoginDetails) => {
		const { data, error } = await supabase.auth.signInWithPassword(user);
		if (!error) {
			await setLoggedIn(data.user);
		}

		return { data, error };
	};

	const logout = async () => {
		const { error } = await supabase.auth.signOut({ scope: "local" });

		if (!error) {
			await setLoggedIn(null);
		}

		return error;
	};

	const getUserProfile = async (user_id) => {
		const { data, error } = await supabase.from("profile").select().eq("user_id", user_id).limit(1).single();

		return { data, error };
	};

	/**
	 *
	 * @returns all unbanned itineraries
	 */
	const getItineraries = async () => {
		const { data, error } = await supabase.from("itinerary").select().eq("itinerary_status", "normal");

		return { data, error };
	};

	/**
	 *
	 * @returns list of all events
	 */
	const getEvents = async () => {
		const { data, error } = await supabase.from("event").select();

		return { data, error };
	};

	/**
	 *
	 * @param events event or array of events to insert
	 * @returns
	 */
	const insertEvents = async (events) => {
		const { data, error } = await supabase.from("event").insert(events);

		return { data, error };
	};

	/**
	 *
	 * @returns ratings made by all users
	 */
	const getRatings = async () => {
		const { data, error } = await supabase.from("rating").select();

		return { data, error };
	};

	/**
	 *
	 * @returns total ratings for a specific post
	 */
	const getPostRatings = async () => {
		const { data, error } = await supabase.from("post_ratings").select();

		return { data, error };
	};

	/**
	 *
	 * @returns all reports made by users
	 */
	const getReports = async () => {
		const { data, error } = await supabase.from("report").select();

		return { data, error };
	};

	/**
	 *
	 * @param userId of a user
	 * @returns list of all itineraries posted by them
	 */
	const getUserItineraries = async (userId) => {
		const { data, error } = await supabase.from("itinerary").select().eq("user_id", userId);

		return { data, error };
	};

	/**
	 *
	 * @param user_id ID of the user
	 * @returns list of all saved itineraries for the user with full details
	 */
	const getSavedItineraries = async (user_id: string) => {
		const { data, error } = await supabase
			.from("saved")
			.select(
				`
                itinerary (
                    post_id,
                    user_id,
                    post_name,
                    destination,
                    price_low,
                    price_high,
                    duration,
                    group_size,
                    is_family_friendly,
                    description,
                    image_url,
                    itinerary_status
                )
            `
			)
			.eq("user_id", user_id)
			.eq("itinerary.itinerary_status", "normal"); // Filter out banned itineraries

		const savedItineraries = data?.map((saved) => saved?.itinerary).filter((itinerary) => itinerary !== null) || null;

		return { data: savedItineraries, error };
	};

	/**
	 *
	 * @param user_id ID of the user
	 * @param post_id ID of the itinerary to save
	 * @returns result of upserting the saved itinerary
	 */
	const saveItinerary = async (user_id: string, post_id: string) => {
		const { data, error } = await supabase
			.from("saved")
			.upsert({ user_id, post_id }, { onConflict: "user_id, post_id" });

		return { data, error };
	};

	/**
	 *
	 * @param file file to upload to the database
	 * @returns public url to the file
	 */
	const uploadImage = async (file) => {
		if (!file) {
			return { error: "No file provided" };
		}

		const fileName = `${Date.now()}_${file.name}`;
		const { data, error } = await supabase.storage
			.from("itinerary-images") // Replace with your bucket name
			.upload(fileName, file);

		if (error) {
			console.error("Error uploading image:", error);
			return { error };
		}

		const { data: publicUrl } = supabase.storage.from("itinerary-images").getPublicUrl(fileName);

		return { publicUrl, error: null };
	};

	/**
	 *
	 * @param newItinerary new itinerary details
	 * @returns post_id to newly created itinerary
	 */
	const insertItinerary = async (newItinerary) => {
		const { data, error } = await supabase.from("itinerary").insert(newItinerary).select("post_id").limit(1).single();
		return { data, error };
	};

	/**
	 *
	 * @param newRating new rating to submit
	 * @returns details of the newly created rating
	 */
	const insertRating = async (newRating) => {
		const { data, error } = await supabase.from("rating").insert(newRating).select().limit(1).single();
		//.single();
		return { data, error };
	};

	/**
	 *
	 * @param newRating rating to upsert
	 * @returns details of the newly upserted rating
	 */
	const upsertRating = async (newRating) => {
		const { data, error } = await supabase
			.from("rating")
			.upsert(newRating, { onConflict: "user_id, post_id" })
			.select()
			.limit(1)
			.single();
		return { data, error };
	};

	/**
     * Deletes all the reports of the itinerary that is not problematic
     * @param postId ID of the itinerary to clear
     * @returns error if any error occurred
     */
    const clearReports = async (postId: string) => {
        if (userProfile?.role === "admin") {
            const { error } = await supabase.from("report").delete().eq("post_id", postId);


            return error;
        }
    };

	/**
	 *
	 * @param post_id id of the itinerary to ban
	 * @returns error if any error occurred
	 */
	const banPost = async (post_id: string) => {
		if (userProfile?.role === "admin") {
			const { error } = await supabase.from("itinerary").update({ itinerary_status: "banned" }).eq("post_id", post_id);

			return error;
		}
	};

	/**
	 * Bans the corresponding user and all of their posts
	 * @param user_id id of the user to ban
	 * @returns an object with banUserAuth, banUser, and banUserPosts async functions
	 */
	const banUserId = (user_id: string) => {
		if (userProfile?.role === "admin") {
			return {
				banUserAuth: supabase.auth.admin.updateUserById(user_id, { ban_duration: "8760h" }),
				banUser: supabase.from("profile").update({ profile_status: "banned" }).eq("user_id", user_id),
				banUserPosts: supabase.from("itinerary").update({ itinerary_status: "banned" }).eq("user_id", user_id),
			};
		}
	};

	/**
	 * Unbans a specific post
	 * @param postId ID of the itinerary to unban
	 * @returns error if any error occurred
	 */
	const unbanPost = async (postId: string) => {
		if (userProfile?.role === "admin") {
			const { error } = await supabase.from("itinerary").update({ itinerary_status: "normal" }).eq("post_id", postId);

			return error;
		}
	};

	/**
	 * Unbans a specific user and all their posts
	 * @param userId ID of the user to unban
	 * @returns an object with unbanUserAuth, unbanUser, and unbanUserPosts async functions
	 */
	const unbanUserId = (userId: string) => {
		if (userProfile?.role === "admin") {
			return {
				unbanUserAuth: supabase.auth.admin.updateUserById(userId, { ban_duration: "0h" }),
				unbanUser: supabase.from("profile").update({ profile_status: "normal" }).eq("user_id", userId),
				unbanUserPosts: supabase.from("itinerary").update({ itinerary_status: "normal" }).eq("user_id", userId),
			};
		}
	};

	/**
	 * Fetches user profiles for the given array of user IDs.
	 * @param userIds Array of user IDs to fetch profiles for.
	 * @returns Array of user profiles containing `user_id` and `profile_status`.
	 */
	const getUserProfiles = async (userIds: string[]) => {
		if (!userIds.length) return { data: [], error: null };

		const { data, error } = await supabase.from("profile").select("user_id, profile_status").in("user_id", userIds);

		return { data, error };
	};

	/**
	 *
	 * @returns all itineraries (even banned ones)
	 */
	const getAllItineraries = async () => {
		const { data, error } = await supabase.from("itinerary").select();

		return { data, error };
	};

	/**
	 * Fetches detailed reports for a specific post, including the name of the post and the user who reported it.
	 * @param post_id ID of the itinerary for which to get reports
	 * @returns Array of detailed reports containing `post_name`, `user_name`, `report_date`, and `reason`.
	 */
	const getDetailedReports = async (post_id) => {
		const { data, error } = await supabase
			.from("report")
			.select(
				`
            post_id,
            report_date,
            reason,
            user_id,
            profile (
                first_name, last_name
            ),
            itinerary (
                post_name
            )
        `
			)
			.eq("post_id", post_id);

		if (error) {
			return { data: null, error };
		}

		const detailedReports = data.map((report) => ({
			post_id: report.post_id,
			post_name: report.itinerary?.post_name || "Unknown",
			report_date: report.report_date,
			reason: report.reason,
			user_id: report.user_id,
			user_name: `${report.profile?.first_name || "Unknown"} ${report.profile?.last_name || ""}`.trim(),
		}));

		return { data: detailedReports, error: null };
	};

	/**
	 * Deletes a specific report by post ID and user ID.
	 * @param postId ID of the post for which the report is to be deleted
	 * @param userId ID of the user who created the report
	 * @returns { error } if an error occurred, or null otherwise.
	 */
	const deleteReport = async (postId, userId) => {
		const { error } = await supabase.from("report").delete().match({ post_id: postId, user_id: userId });

		return { error };
	};

		/**
 *
 * @param userId ID of the user attempting to delete the itinerary
 * @param postId ID of the itinerary to be deleted
 * @returns result of the deletion
 */
const deleteItinerary = async (userId, postId) => {
    // Ensure only the owner can delete the itinerary
    const { data, error } = await supabase
        .from("itinerary")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId); // Verify the user_id matches

    if (error) {
        console.error("Error deleting itinerary:", error);
    }

    return { data, error };
};


	return (
		<>
			<SupabaseContext.Provider
				value={{
					supabase,
					user,
					userProfile,
					register,
					login,
					logout,
					getItineraries,
					getSavedItineraries,
					saveItinerary,
					getEvents,
					insertEvents,
					getRatings,
					getPostRatings,
					getReports,
					getUserItineraries,
					uploadImage,
					insertItinerary,
					insertRating,
					upsertRating,
					clearReports,
					banPost,
					banUserId,
					unbanPost,
					unbanUserId,
					getUserProfiles,
					getAllItineraries,
					getDetailedReports,
					deleteReport,
					deleteItinerary,
				}}
			>
				{children}
			</SupabaseContext.Provider>
		</>
	);
}

export default function useSupabase() {
	return useContext(SupabaseContext);
}

type RegisterDetails = {
	email: string;
	password: string;
	options: {
		data: {
			first_name: string;
			last_name: string;
		};
	};
};

type LoginDetails = {
	email: string;
	password: string;
};

type SupabaseContextType = {
	supabase: SupabaseClient;
	user: User | null;
	userProfile: Database["public"]["Tables"]["profile"]["Row"] | null;
	register: (user: RegisterDetails) => Promise<{
		data:
			| {
					user: User | null;
					session: Session | null;
			  }
			| {
					user: null;
					session: null;
			  };
		error: AuthError | null;
	}>;
	// setUser: React.Dispatch<React.SetStateAction<User | null>>;
	login: (user: LoginDetails) => Promise<{
		data:
			| {
					user: User;
					session: Session;
					weakPassword?: WeakPassword;
			  }
			| {
					user: null;
					session: null;
					weakPassword?: null;
			  };
		error: AuthError | null;
	}>;
	logout: () => Promise<AuthError | null>;
	getItineraries: () => Promise<{
		data: Database["public"]["Tables"]["itinerary"]["Row"][] | null;
		error: PostgrestError | null;
	}>;
	getSavedItineraries: (user_id: string) => Promise<{
		data: Database["public"]["Tables"]["itinerary"]["Row"][] | null;
		error: PostgrestError | null;
	}>;

	saveItinerary: (
		user_id: string,
		post_id: string
	) => Promise<{
		data:
			| {
					user_id: string;
					post_id: string;
			  }[]
			| null;
		error: PostgrestError | null;
	}>;
	getEvents: () => Promise<{
		data:
			| {
					day: number;
					location: string;
					post_id: string;
					time: string;
			  }[]
			| null;
		error: PostgrestError | null;
	}>;
	insertEvents: (events: any) => Promise<{
		data: null;
		error: PostgrestError | null;
	}>;
	getRatings: () => Promise<{
		data:
			| {
					comment: string | null;
					comment_date: string;
					is_good: boolean;
					post_id: string;
					user_id: string;
			  }[]
			| null;
		error: PostgrestError | null;
	}>;
	getPostRatings: () => Promise<{
		data:
			| {
					is_good: boolean;
					post_id: string;
					total: number;
			  }[]
			| null;
		error: PostgrestError | null;
	}>;
	getReports: () => Promise<{
		data:
			| {
					post_id: string;
					reason: string;
					report_date: string;
					user_id: string;
			  }[]
			| null;
		error: PostgrestError | null;
	}>;
	getUserItineraries: (userId: any) => Promise<{
		data: Database["public"]["Tables"]["itinerary"]["Row"][] | null;
		error: PostgrestError | null;
	}>;
	uploadImage: (file: any) => Promise<
		| {
				error: string;
				publicUrl?: undefined;
		  }
		| {
				error: StorageError;
				publicUrl?: undefined;
		  }
		| {
				publicUrl: any;
				error: null;
		  }
	>;
	insertItinerary: (newItinerary: any) => Promise<{
		data: {
			post_id: string;
		} | null;
		error: PostgrestError | null;
	}>;
	insertRating: (newRating: any) => Promise<{
		data: Database["public"]["Tables"]["rating"]["Insert"] | null;
		error: PostgrestError | null;
	}>;
	upsertRating: (newRating: any) => Promise<{
		data: Database["public"]["Tables"]["rating"]["Update"] | null;
		error: PostgrestError | null;
	}>;
	clearReports: (post_id: string) => Promise<PostgrestError | null | undefined>;
	banPost: (post_id: string) => Promise<PostgrestError | null | undefined>;
	banUserId: any;
	unbanPost: (post_id: string) => Promise<PostgrestError | null | undefined>;
	unbanUserId: any;
	getUserProfiles: (userIds: string[]) => Promise<{
		data: { user_id: string; profile_status: string }[] | null;
		error: PostgrestError | null;
	}>;
	getAllItineraries: () => Promise<{
		data: Database["public"]["Tables"]["itinerary"]["Row"][] | null;
		error: PostgrestError | null;
	}>;
	getDetailedReports: (post_id: string) => Promise<{
		data:
			| {
					post_id: string;
					post_name: string;
					report_date: string;
					reason: string;
					user_id: string;
					user_name: string;
			  }[]
			| null;
		error: PostgrestError | null;
	}>;
	deleteReport: (postId: string, userId: string) => Promise<{ error: PostgrestError | null }>;
};
