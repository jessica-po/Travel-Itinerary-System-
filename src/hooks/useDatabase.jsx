// OLD! USE SupabaseContext.tsx INSTEAD!
// import { createClient } from "@supabase/supabase-js";
// import { publicAnonKey, url } from "../../supabase.token";

// const supabase = createClient(url, publicAnonKey);


// const useDatabase = () => {

//     const getLoggedInUser = async () => {
//         const { data, error } = await supabase.auth.getUser();
//         return { user: data?.user, error };
//     };


//     const getEvents = async () => {
//         const { data, error } = await supabase
//             .from('event')  // Fetch from 'event' table
//             .select();

//         return { data, error };
//     };

//     const insertEvents = async (events) => {
//         const { data, error } = await supabase
//           .from("event")
//           .insert(events);
//         return { data, error };
//       };

//     const getItineraries = async () => {
//         const { data, error } = await supabase
//             .from('itinerary')
//             .select();

//         return { data, error }
//     }

//     const getRatings = async () => {
//         const { data, error } = await supabase
//             .from('rating')
//             .select();
        
//         return { data, error }
//     }

//     const getReports = async () => {
//         const { data, error } = await supabase
//             .from('report')
//             .select();
        
//         return { data, error }
//     }

//     //double check this
//     const getUserItineraries = async (userId) => {
//         const { data, error } = await supabase
//             .from('itinerary')
//             .select()
//             .eq('user_id', userId);

//         return { data, error }
//     }

//     const uploadImage = async (file) => {
//         if (!file) {
//             return { error: "No file provided" };
//         }

//         const fileName = `${Date.now()}_${file.name}`;
//         const { data, error } = await supabase.storage
//             .from("itinerary-images") // Replace with your bucket name
//             .upload(fileName, file);

//         if (error) {
//             console.error("Error uploading image:", error);
//             return { error };
//         }

//         const { publicUrl } = supabase.storage
//             .from("itinerary-images")
//             .getPublicUrl(fileName);

//         return { publicUrl, error: null };
//     };

//     const insertItinerary = async (newItinerary) => {
//         const { data, error } = await supabase
//             .from("itinerary")
//             .insert(newItinerary)
//             .select("post_id")
//             .single();
//         return { data, error };
//     };

//     const insertRating = async (newRating) => {
//         const { data, error } = await supabase
//             .from("rating")
//             .insert(newRating)
//             .select()
//             //.single();
//         return { data, error };
//     };

//     const upsertRating = async (newRating) => {
//         const { data, error } = await supabase
//             .from('rating')
//             .upsert(
//                 {
//                     user_id: newRating.user_id,
//                     post_id: newRating.post_id,
//                     is_good: newRating.is_good,
//                     comment: newRating.comment
//                 },
//                 { onConflict: ['user_id', 'post_id'] } // Specify the columns that define uniqueness
//             )
//             .select('*'); // Optional: Return the updated or inserted row(s)
//         return { data, error };
//     };
    
  


//     return { getLoggedInUser, insertEvents, getItineraries, getEvents, getRatings, getReports, uploadImage, getUserItineraries, insertItinerary, insertRating, upsertRating };

// };

// export default useDatabase;
