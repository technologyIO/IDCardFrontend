import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
function ArchiveEvent() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events/archiveevent`
      );
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, []);
  const handleDelete = (id) => {
    Swal.fire({
      title: "Archive Event?",
      text: "This will archive the event and it won't be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, archive it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(`${process.env.REACT_APP_API_URL}/api/events/archive/${id}`, {
            archive: false,
          })
          .then((res) => {
            Swal.fire("Archived!", "Event has been archived.", "success");
            fetchEvents(); // Assuming fetchEvents is a function to fetch updated events list
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };
  return (
    <div>
      <header className="sticky top-0 z-50 w-full bg-gray-200 shadow-sm">
        <div className="flex h-16 mx-auto items-center justify-between px-4 lg:px-[80px]">
          <a className="flex items-center gap-2" href="/event" rel="ugc">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M8 2v4"></path>
              <path d="M16 2v4"></path>
              <rect width="18" height="18" x="3" y="4" rx="2"></rect>
              <path d="M3 10h18"></path>
            </svg>
            <span className="font-bold tracking-tight">
              Event ID Card Generator App
            </span>
          </a>
          
       
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Events</h1>

        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <span class="loader"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events
              .slice()
              .reverse()
              .map((event) => (
                <>
                  <div
                    key={event._id}
                    class="relative h-64 cursor-pointer overflow-hidden rounded-lg"
                  >
                    {event.photoUrl ? (
                      <img
                        src={event.photoUrl}
                        alt={event.eventName}
                        className="w-full h-full object-cover"
                        width="600"
                        height="400"
                        style={{ aspectRatio: "600/400", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="w-full h-60 bg-gray-200 flex items-center justify-center">
                        No Image
                      </div>
                    )}
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex gap-4 justify-between">
                        <button className="bg-yellow-400 text-black px-5 p-2 h-6 shadow-full flex items-center rounded font-bold  ">
                          {" "}
                          IDCARD - {event.participantCount}
                        </button>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDelete(event._id)}
                            className="bg-gray-600 text-white px-5 p-2 rounded font-bold hover:bg-blue-700 "
                          >
                            {" "}
                            UnArchive
                          </button>
                        </div>
                      </div>
                      <div class="flex h-full flex-col justify-end">
                        <h3 class="text-3xl mb-1 font-bold text-white">
                          {event.eventName}
                        </h3>
                        <div class="flex items-center gap-2 mb-8 shadow-full  text-sm text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="h-4 w-4"
                          >
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="4"
                              rx="2"
                            ></rect>
                            <path d="M3 10h18"></path>
                          </svg>
                          <span className="font-bold">
                            {new Date(event.date).toDateString()}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="h-4 w-4"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span className="font-bold">{event.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArchiveEvent;
