import React, { useState, useEffect } from "react";
import styles from "./CreateItinerary.module.css";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import useSupabase from "../../context/SupabaseContext";

export default function CreateItinerary() {
  const navigate = useNavigate();
  const [itineraryName, setItineraryName] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(0);
  const [schedule, setSchedule] = useState([]);
  const [priceLow, setPriceLow] = useState(0);
  const [priceHigh, setPriceHigh] = useState(0);
  const [groupSize, setGroupSize] = useState(0);
  const [isFamilyFriendly, setIsFamilyFriendly] = useState(false);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  // const [userId, setUserId] = useState(null);
  const { uploadImage, user, insertEvents, insertItinerary } = useSupabase();

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     if (error || !user) {
  //       console.error("Error fetching user:", error);
  //       alert("Please log in to create an itinerary.");
  //       navigate("/login");
  //     } else {
  //       setUserId(user.id);
  //     }
  //   };
  //   fetchUser();
  // }, [getLoggedInUser, navigate]);

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index][field] = value;
    setSchedule(updatedSchedule);
  };

  const handleAddRow = (index) => {
    const newRow = { 
        day: `${index + 1}`, 
        time: "", 
        location: "" 
    };
    const updatedSchedule = [
      ...schedule.slice(0, index + 1),
      newRow,
      ...schedule.slice(index + 1),
    ];
    setSchedule(updatedSchedule);
  };
  

  const handleDeleteRow = (index) => {
    if (index === 0) return;
    const updatedSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(updatedSchedule);
  };

  /*Setting Schedule (event list)*/
  const createScheduleOutline = (e) => {
    const numberOfDays = parseInt(e.target.value, 10);
    if (numberOfDays <= 0) {
      return;
    }
    setDays(numberOfDays);
    if (numberOfDays > 0) {
      const newSchedule = Array.from({ length: numberOfDays }, (_, index) => ({
        day: `${index + 1}`,
        time: "",
        location: "",
      }));
      setSchedule(newSchedule);
    } else {
      setSchedule([]);
    }
  };

  /*Setting Lower Bound Price Variable*/
  const handlePriceRangeLow = (e) => {
    let value = e.target.value.replace("$", "");
    value = parseFloat(value);
    if (!isNaN(value)) {
      value = Math.round(value);
    } else {
      value = 0;
    }
    setPriceLow(value);
  };

  /*Setting Upper Bound Price Variable*/
  const handlePriceRangeHigh = (e) => {
    let value = e.target.value.replace("$", "");
    value = parseFloat(value);
    if (!isNaN(value)) {
      value = Math.round(value);
    } else {
      value = 0;
    }
    setPriceHigh(value);
  };

  /*Setting Group Size Variable*/
  const handleGroupSize = (e) => {
    const groupSizeNumber = parseInt(e.target.value, 10);
    if (isNaN(groupSizeNumber) || groupSizeNumber < 0) {
      setGroupSize(0);
      return;
    }
    setGroupSize(groupSizeNumber);
  };

  /*Setting Family Friendly Variable*/
  const handleCheckboxChange = (e) => {
    setIsFamilyFriendly(e.target.checked);
  };

  /*Setting Image File */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  /*Leave Create Itinerary */
  const handleBack = () => {
    navigate("/my-itineraries");
  };

  /*Posting Itinerary */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.id) {
      alert("You must be logged in to create an itinerary.");
      return;
    }

    // Upload the image
    const { publicUrl, error: uploadError } = await uploadImage(imageFile);

    if (uploadError) {
      console.error("Image upload failed:", uploadError);
      alert("Failed to upload image. Please try again.");
      return;
    }

    // Insert the itinerary
    const newItinerary = {
      user_id: user.id,
      post_name: itineraryName,
      destination,
      price_low: priceLow,
      price_high: priceHigh,
      duration: days,
      group_size: groupSize,
      is_family_friendly: isFamilyFriendly,
      image_url: publicUrl.publicUrl,
      description,
    };

    const { data: itineraryData, error: itineraryError } = await insertItinerary(newItinerary);

    if (itineraryError) {
      console.error("Failed to create itinerary:", itineraryError);
      alert("Failed to create itinerary. Please try again.");
      return;
    }

    const postId = itineraryData?.post_id;
    console.log("Itinerary inserted:", itineraryData);

    const eventRows = schedule.map((item) => ({
      post_id: postId,
      day: item.day,
      time: item.time,
      location: item.location,
    }));

    const { error: eventError } = await insertEvents(eventRows);

    if (eventError) {
      console.error("Failed to save events:", eventError);
      alert("Failed to save events. Please try again.");
      return;
    }

    alert("Itinerary and events successfully created!");
    navigate("/my-itineraries");
  };

  return (
    <div className={styles.createItinerary}>
      <h2>Create an Itinerary</h2>
      <div className={styles.formContent}>
        <TextField
          label="Itinerary Name"
          value={itineraryName}
          onChange={(e) => setItineraryName(e.target.value)}
          variant="outlined"
          fullWidth
          required
        />
        <TextField
          label="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          variant="outlined"
          fullWidth
          required
        />
        <TextField
          label="Days"
          type="number"
          variant="outlined"
          value={days}
          onChange={createScheduleOutline}
          required
        />

        <div className={styles.tableContainer}>
          <table className={styles.itineraryTable}>
            <thead>
              <tr>
                <th></th>
                <th>Day</th>
                <th>Time</th>
                <th>Location</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => (
                <tr key={index}>
                  <td className={styles.addCell}>
                    <Button
                      onClick={() => handleAddRow(index)}
                      variant="contained"
                      size="small"
                    >
                      +
                    </Button>
                  </td>
                  <td className={styles.dayColumn}>
                    <TextField
                      type="text"
                      value={item.day || ""}
                      placeholder="Day"
                      fullWidth
                      required
                    />
                  </td>
                  <td className={styles.timeColumn}>
                    <TextField
                      type="time"
                      value={item.time}
                      onChange={(e) =>
                        handleScheduleChange(index, "time", e.target.value)
                      }
                      fullWidth
                      required
                    />
                  </td>
                  <td className={styles.locationColumn}>
                    <TextField
                      type="text"
                      value={item.location}
                      placeholder="Location"
                      onChange={(e) =>
                        handleScheduleChange(index, "location", e.target.value)
                      }
                      fullWidth
                      required
                    />
                  </td>
                  <td className={styles.deleteCell}>
                    <Button
                      onClick={() => handleDeleteRow(index)}
                      variant="outlined"
                      size="small"
                      className={styles.deleteCell}
                    >
                      ×
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.restForm}>
            <TextField
              label="Description"
              multiline
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              rows={10}
            />

            {/* sys limitation: int only */}
            <div className={styles.priceRange}>
              <label>Price Range: </label>
              <TextField
                label="From $"
                placeholder="0.00"
                variant="outlined"
                value={priceLow}
                onChange={(e) => setPriceLow(e.target.value)} // Update value while typing
                onBlur={handlePriceRangeLow}
                required
              />
              <span>to</span>
              <TextField
                label="To $"
                placeholder="0.00"
                variant="outlined"
                value={priceHigh}
                onChange={(e) => setPriceHigh(e.target.value)} // Update value while typing
                onBlur={handlePriceRangeHigh}
                required
              />
            </div>

            <TextField
              label="Group Size"
              value={groupSize}
              onChange={handleGroupSize}
              type="number"
              variant="outlined"
              fullWidth
              required
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={isFamilyFriendly}
                  onChange={handleCheckboxChange}
                  color="primary"
                  className={styles.formLabels}
                  required
                />
              }
              label="Family Friendly?"
            />

            {/* handle */}
            <div>
              <label>Image: </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button onClick={handleBack} variant="outlined">
              Back to My Itineraries
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              className={styles.postButton}
            >
              POST
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
