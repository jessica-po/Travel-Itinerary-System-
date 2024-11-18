import { createClient } from "@supabase/supabase-js";
import { publicAnonKey, url } from "../../supabase.token";
import { useState } from "react";

const useDatabase = () => {
    const [ supabase, _ ] = useState(createClient(url, publicAnonKey));

    const getEvents = async () => {
        const { data, error } = await supabase
            .from('event')  // Fetch from 'event' table
            .select();

        return { data, error };
    };

    const getItineraries = async () => {
        const { data, error } = await supabase
            .from('itinerary')
            .select();

        return { data, error }
    }

    const getRatings = async () => {
        const { data, error } = await supabase
            .from('post_ratings')
            .select();
        
        return { data, error }
    }

    return { getItineraries, getEvents, getRatings }
};

export default useDatabase;
