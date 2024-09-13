import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function Approved() {
  const { participantId } = useParams();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL+`/api/participants/participant/${participantId}`
        );
        setParticipant(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [participantId]);

  const handleAmenityChange = (amenity) => {
    const updatedAmenities = {
      ...participant.amenities,
      [amenity]: !participant.amenities[amenity],
    };
    setParticipant((prev) => ({
      ...prev,
      amenities: updatedAmenities,
    }));
  };

  const saveAmenities = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/participants/participant/${participantId}/amenities`,
        {
          amenities: participant.amenities,
        }
      );
      setParticipant(response.data);
      toast.success("Approved");
    } catch (error) {
      console.error("Error updating amenities:", error);
      toast.error("Error updating amenities:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching participant details</div>;

  return (
    <div>
      <div className="container mx-auto my-10 px-4 md:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="flex-shrink-0">
              <span className="relative flex shrink-0 overflow-hidden rounded-full w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 border-2 border-primary">
                <img
                  className="aspect-square h-full w-full"
                  alt="Participant"
                  src={
                    participant.profilePicture ||
                    "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/corporate-user-icon.png"
                  }
                />
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="grid lg:grid-cols-2 items-center gap-4">
                <h2 className="text-2xl font-bold">
                  {participant.firstName} {participant.lastName}
                </h2>
                <div>
                  <span className="bg-gray-300  mt-1   px-3 py-1 rounded text-sm font-bold">
                    ID: {participant.participantId}
                  </span>
                </div>
              </div>
              <div className="font-semibold grid lg:grid-cols-2 gap-5 py-4 ">
                <div className="flex">
                  <p className="border rounded px-3 text-center py-1 bg-gray-300 shadow ">
                    Designation: {participant.designation}
                  </p>
                </div>
                <div className="flex">
                  <p className="border px-3 rounded text-center py-1 bg-gray-300 shadow">
                    Institute: {participant.institute}
                  </p>
                </div>
              </div>
            </div>
            
          </div>
          <div className="bg-muted rounded-lg p-6 md:p-8 lg:p-10">
            <h3 className="text-xl font-bold mb-4">Event Amenities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participant.amenities &&
                Object.keys(participant.amenities).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {participant.amenities[amenity] ? (
                      <div className="flex items-center gap-2 border border-green-200   bg-green-200 rounded-sm p-1 px-2">
                        <input
                          type="checkbox"
                          checked
                          className="peer h-4 w-4 shrink-0 rounded-sm border border-blue-200 ring-offset-background bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="text-black font-bold">{amenity}</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          checked={participant.amenities[amenity]}
                          onChange={() => handleAmenityChange(amenity)}
                          className="peer h-4 w-4 shrink-0 rounded-sm border border-blue-500 ring-offset-background bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id={`amenity-${index}`}
                        />
                        <label
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          htmlFor={`amenity-${index}`}
                        >
                          {amenity}
                        </label>
                      </>
                    )}
                  </div>
                ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveAmenities}
                className="border p-2 px-7 bg-black text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Approved;
