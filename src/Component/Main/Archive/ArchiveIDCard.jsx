import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

function ArchiveIDCard() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState(null); // Initialize eventId as null
  const [data, setData] = useState([]); // Initialize data as an empty array

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventid = params.get("eventid");

    if (eventid) {
      setEventId(eventid); // Set eventId only if it exists in the query params
      fetchData(eventid); // Fetch data for the eventId
    } else {
      setLoading(false);
    }
  }, [location.search]); // Trigger useEffect when location.search changes

  const fetchData = async (eventId) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/participants/participentarchive/${eventId}`;
      const response = await axios.get(url);
      console.log("Participants by EventId:", response.data); // Log fetched participants
      setData(response.data); // Update state with fetched data
      setLoading(false);
    } catch (error) {
      console.error("Error fetching participants by eventId:", error);
      setData([]); // Clear state or handle error case
      setLoading(false);
    }
  };

  const handleArchive = (id) => {
    Swal.fire({
      title: "Unarchive ID Card?",
      text: "This will unarchive the ID Card.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unarchive it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(`${process.env.REACT_APP_API_URL}/api/participants/unarchive/${id}`, {
            archive: false,
          }) // PATCH request to unarchive participant
          .then((res) => {
            Swal.fire("Unarchived!", "ID Card has been unarchived.", "success");
            // Fetch data again with the correct eventId
            fetchData(eventId);
            console.log("Unarchived");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const filteredData = data.filter((card) => card.archive);
  const reversedData = [...filteredData].reverse();

  return (
    <div className="container mx-auto text-3xl font-bold my-7 ">
      Archive ID Cards...
      <div className="flex flex-wrap container mx-auto p-10 justify-center gap-5">
        <div></div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          reversedData.map((card, index) => (
            <div
              key={`id-card-${index}`} // Added key prop for each card
              className="relative rounded-[1px] h-[580px] w-[430px]"
              style={{
                backgroundImage: `url(${card.backgroundImage})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                imageRendering: "crisp-edges",
              }}
            >
              <div className="relative z-10 flex justify-center h-full text-white">
                <div className="overflow-hidden flex-col justify-center lg:mt-[200px] mt-[242px] border-white">
                  <h2 className="text-lg text-center mb-2 font-bold">
                    {card.firstName} {card.lastName}
                  </h2>
                  <div className="flex justify-center">
                    <img
                      src={card.profilePicture}
                      style={{ objectFit: "cover" }}
                      alt="Profile"
                      className="lg:h-[150px] rounded-[2px] lg:w-[150px] h-[140px] w-[140px]"
                    />
                  </div>
                  <p className="lg:text-xl text-[12px] font-semibold mt-2 text-center">
                    {card.institute}
                  </p>
                  <p className="font-bold mt-6 text-[15px] mb-[2px] text-black text-center">
                    {card.designation}
                  </p>
                  <div className="text-black text-[15px] text-center font-bold">
                    {card.participantId}
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => handleArchive(card._id)}
                  className="border rounded bg-gray text-center p-1 px-2 bg-gray-400 hover:bg-slate-600"
                >
                  UnArchive
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ArchiveIDCard;
