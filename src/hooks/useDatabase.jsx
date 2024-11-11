import { createClient } from "@supabase/supabase-js";
import { publicAnonKey, url } from "../../supabase.token";
import { useState } from "react";

const useDatabase = () => {
    const [ supabase, _ ] = useState(createClient(url, publicAnonKey));

    const getItineraries = async () => {
        const { data, error } = await supabase
            .from('itinerary')
            .select();

        return { data, error }
    }
    return { getItineraries }
};

export default useDatabase;
