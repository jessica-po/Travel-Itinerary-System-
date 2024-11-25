import { AuthError, createClient, PostgrestError, Session, SupabaseClient, User, WeakPassword } from "@supabase/supabase-js";
import React, { createContext, useContext, useState } from "react";
import { publicAnonKey, url } from "../../supabase.token";
import { Database } from "../../database.types";
import { StorageError } from "@supabase/storage-js"

export const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function SupabaseContextProvider({ children }) {
    const [ supabase, _ ] = useState(createClient<Database>(url, publicAnonKey));
    const [ user, setUser ] = useState<User | null>(null);
    const [ userProfile, setUserProfile ] = useState<Database['public']['Tables']['profile']['Row'] | null>(null);

    const setLoggedIn = async (user: User | null) => {
        setUser(user);
        
        if(user === null) {
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

    const getUserProfile = user_id => supabase
        .from('profile')
        .select()
        .eq('user_id', user_id)
        .limit(1)
        .single();

    const getItineraries = async () => {
        const { data, error } = await supabase
            .from('itinerary')
            .select();

        return { data, error };
    };

    /**
     * 
     * @returns list of all events
     */
    const getEvents = async () => {
        const { data, error } = await supabase
            .from('event')
            .select();

        return { data, error };
    };

    /**
     * 
     * @param events event or array of events to insert
     * @returns 
     */
    const insertEvents = async (events) => {
        const { data, error } = await supabase
            .from("event")
            .insert(events);

        return { data, error };
    };

    /**
     * 
     * @returns ratings made by all users
     */
    const getRatings = async () => {
        const { data, error } = await supabase
            .from('rating')
            .select();

        return { data, error };
    };

    /**
     * 
     * @returns all reports made by users
     */
    const getReports = async () => {
        const { data, error } = await supabase
            .from('report')
            .select();

        return { data, error };
    };

    /**
     * 
     * @param userId of a user
     * @returns list of all itineraries posted by them
     */
    const getUserItineraries = async (userId) => {
        const { data, error } = await supabase
            .from('itinerary')
            .select()
            .eq('user_id', userId);

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

        const { data: publicUrl } = supabase.storage
            .from("itinerary-images")
            .getPublicUrl(fileName);

        return { publicUrl, error: null };
    };

    /**
     * 
     * @param newItinerary new itinerary details
     * @returns post_id to newly created itinerary
     */
    const insertItinerary = async (newItinerary) => {
        const { data, error } = await supabase
            .from("itinerary")
            .insert(newItinerary)
            .select("post_id")
            .limit(1)
            .single();
        return { data, error };
    };

    /**
     * 
     * @param newRating new rating to submit
     * @returns details of the newly created rating
     */
    const insertRating = async (newRating) => {
        const { data, error } = await supabase
            .from("rating")
            .insert(newRating)
            .select()
            .limit(1)
            .single();
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
            .from('rating')
            .upsert(newRating, { onConflict: 'user_id, post_id' }) // Specify the columns that define uniqueness
            .select()
            .limit(1)
            .single(); // Optional: Return the updated or inserted row(s)
        return { data, error };
    };

    return <>
        <SupabaseContext.Provider value={{
            supabase, user, userProfile,
            register, login, logout,
            getItineraries, getEvents, insertEvents, getRatings, getReports, getUserItineraries, uploadImage, insertItinerary, insertRating, upsertRating
        }}>
            {children}
        </SupabaseContext.Provider>
    </>;
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
    userProfile: Database['public']['Tables']['profile']['Row'] | null;
    register: (user: RegisterDetails) => Promise<{
        data: {
            user: User | null;
            session: Session | null;
        } | {
            user: null;
            session: null;
        };
        error: AuthError | null;
    }>;
    // setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (user: LoginDetails) => Promise<{
        data: {
            user: User;
            session: Session;
            weakPassword?: WeakPassword;
        } | {
            user: null;
            session: null;
            weakPassword?: null;
        };
        error: AuthError | null;
    }>;
    logout: () => Promise<AuthError | null>;
    getItineraries: () => Promise<{
        data: Database['public']['Tables']['itinerary']['Row'][] | null;
        error: PostgrestError | null;
    }>;
    getEvents: () => Promise<{
        data: {
            day: number;
            location: string;
            post_id: string;
            time: string;
        }[] | null;
        error: PostgrestError | null;
    }>;
    insertEvents: (events: any) => Promise<{
        data: null;
        error: PostgrestError | null;
    }>;
    getRatings: () => Promise<{
        data: {
            comment: string | null;
            comment_date: string;
            is_good: boolean;
            post_id: string;
            user_id: string;
        }[] | null;
        error: PostgrestError | null;
    }>;
    getReports: () => Promise<{
        data: {
            post_id: string;
            reason: string;
            report_date: string;
            user_id: string;
        }[] | null;
        error: PostgrestError | null;
    }>;
    getUserItineraries: (userId: any) => Promise<{
        data: Database['public']['Tables']['itinerary']['Row'][] | null;
        error: PostgrestError | null;
    }>;
    uploadImage: (file: any) => Promise<{
        error: string;
        publicUrl?: undefined;
    } | {
        error: StorageError;
        publicUrl?: undefined;
    } | {
        publicUrl: any;
        error: null;
    }>;
    insertItinerary: (newItinerary: any) => Promise<{
        data: {
            post_id: string;
        } | null;
        error: PostgrestError | null;
    }>;
    insertRating: (newRating: any) => Promise<{
        data: Database['public']['Tables']['rating']['Insert'] | null;
        error: PostgrestError | null;
    }>;
    upsertRating: (newRating: any) => Promise<{
        data: Database['public']['Tables']['rating']['Update'] | null;
        error: PostgrestError | null;
    }>;
}
