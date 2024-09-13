import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import EditEvents from "./Edit/EditEvents";
function EventPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [Dataid, setDataid] = useState("");
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  const [showEditModal, setActiveEventId] = useState(null); // State to track which event's modal is open

  const toggleEditModal = (eventId) => {
    setActiveEventId(eventId);
  };
  const [inputs, setInputs] = useState([]);
  const [currentInput, setCurrentInput] = useState("");

  const [currentCategory, setCurrentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [currentAmenity, setCurrentAmenity] = useState("");
  const [amenities, setAmenities] = useState([]);

  const addCategory = () => {
    if (currentCategory.trim()) {
      setCategories([...categories, currentCategory.trim()]);
      setCurrentCategory("");
    }
  };

  const addAmenity = () => {
    if (currentAmenity.trim()) {
      setAmenities([...amenities, currentAmenity.trim()]);
      setCurrentAmenity("");
    }
  };

  const removeCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const removeAmenity = (index) => {
    const newAmenities = amenities.filter((_, i) => i !== index);
    setAmenities(newAmenities);
  };

  const [eventName, setEventName] = useState("");
  const [address, setAddress] = useState("");
  const [endDate, setendDate] = useState("");
  const [startDate, setDate] = useState("");
  const [photo, setPhoto] = useState(null); // State to hold base64 encoded image
  const [idcardimage, setIdcardimage] = useState(null); // State to hold base64 encoded image
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventID] = useState("");

  const [isCreating, setIsCreating] = useState(false); // New state for loading spinner

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append("eventName", eventName);
      formData.append("address", address);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("photo", photo); // Append event image
      formData.append("idcardimage", idcardimage); // Append ID card image
      formData.append("categories", JSON.stringify(categories)); // Convert categories to JSON string

      // Convert amenities array to an object
      const amenitiesObject = amenities.reduce((acc, amenity) => {
        acc[amenity] = false;
        return acc;
      }, {});
      formData.append("amenities", JSON.stringify(amenitiesObject)); // Convert amenities to JSON string

      // Debugging: Log FormData entries
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/events`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Event created:", response.data);
      toggleModal();
      fetchEvents();
      toast.success("Event created successfully!", "Success");
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsCreating(false); // Stop loading spinner
    }
  };

  const handleFileChange = (e) => {
    const { id, files } = e.target;
    console.log(`Files selected for ${id}:`, files);
    if (files.length > 0) {
      if (id === "event-image") {
        setPhoto(files[0]);
      } else if (id === "idcard-image") {
        setIdcardimage(files[0]);
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + `/api/events`
      );
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };
  console.log("Events", events);

  const fetchData = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/participants/event/${eventId}`;
      const response = await axios.get(url);
      console.log("Participants by EventId:", response.data); // Log fetched participants
      setDataid(response.data); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching participants by eventId:", error);
      setDataid([]); // Clear state or handle error case
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);
  const handleTaskView = (groupId, groupName) => {
    setEventID(groupId);
    // Navigate to the /task route with the group ID and group name as parameters
    navigate(`/create-id?eventid=${groupId}&eventName=${groupName}`);
  };
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState({
    name: "Tom Cook",
    imgSrc:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  });

  const options = [
    {
      name: "Wade Cooper",
      imgSrc:
        "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    // Add more options here
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

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
          .patch(process.env.REACT_APP_API_URL+`/api/events/archive/${id}`, {
            archive: true,
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/");
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
            <span className="font-bold hidden lg:block tracking-tight">
              Event ID Card Generator App
            </span>
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleModal}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium bg-black text-white transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
            >
              Create Event
            </button>

            <div>
              <div className="relative ">
                <button
                  type="button"
                  className="relative w-full cursor-default rounded-md bg-white h-10 py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                  aria-haspopup="listbox"
                  aria-expanded={isOpen}
                  aria-labelledby="listbox-label"
                  onClick={handleToggle}
                >
                  <span className="flex items-center">
                    <img
                      src="https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/corporate-user-icon.png"
                      alt=""
                      className="h-5 w-5 flex-shrink-0 rounded-full"
                    />
                    <span className="ml-3 block  truncate">
                      {selectedOption.name}
                    </span>
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {options.map((option, index) => (
                      <>
                        <li
                          key={index}
                          className={`relative select-none py-2 hover:bg-gray-200 cursor-pointer px-3 ${
                            option === selectedOption
                              ? "bg-indigo-600 text-white"
                              : "text-gray-900"
                          }`}
                          role="option"
                          onClick={() => navigate("/archive-event")}
                        >
                          <div className="flex items-center text-[15px]  justify-between">
                            Archive Events{" "}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="currentColor"
                              class="bi bi-file-earmark-zip"
                              viewBox="0 0 16 16"
                            >
                              <path d="M5 7.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v.938l.4 1.599a1 1 0 0 1-.416 1.074l-.93.62a1 1 0 0 1-1.11 0l-.929-.62a1 1 0 0 1-.415-1.074L5 8.438zm2 0H6v.938a1 1 0 0 1-.03.243l-.4 1.598.93.62.929-.62-.4-1.598A1 1 0 0 1 7 8.438z" />
                              <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1h-2v1h-1v1h1v1h-1v1h1v1H6V5H5V4h1V3H5V2h1V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z" />
                            </svg>
                          </div>

                          {option === selectedOption && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </li>
                        <li
                          key={index}
                          className={`relative hover:bg-gray-200 cursor-pointer select-none  border-t-2 py-2 px-3 ${
                            option === selectedOption
                              ? "bg-indigo-600 text-white"
                              : "text-gray-900"
                          }`}
                          role="option"
                          onClick={handleLogout}
                        >
                          <div className="flex items-center text-[15px]  justify-between">
                            Logout{" "}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="currentColor"
                              class="bi bi-box-arrow-right"
                              viewBox="0 0 16 16"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
                              />
                              <path
                                fill-rule="evenodd"
                                d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
                              />
                            </svg>
                          </div>

                          {option === selectedOption && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </li>
                      </>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {showModal && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
        >
          <div className="relative p-4 w-full max-w-4xl max-h-full">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Create an Event
                  </h1>
                </div>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                  onClick={toggleModal}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="w-full max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto h-[450px] sm:max-h-screen">
                <div className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="eventName"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Event Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="eventName"
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter Event Name"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="address"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Address
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="address"
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="Category"
                          className="block mb-1 text-sm font-medium text-gray-700"
                        >
                          Category
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="text"
                            value={currentCategory}
                            onChange={(e) => setCurrentCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add Category"
                          />
                          <button
                            onClick={addCategory}
                            className="px-4 w-20 bg-black h-8 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Add
                          </button>
                        </div>
                        <div className="mt-4">
                          {categories.length > 0 && (
                            <ul className="list-disc list-inside space-y-2">
                              {categories.map((category, index) => (
                                <li
                                  key={index}
                                  className="flex items-center justify-between text-gray-700"
                                >
                                  <span>{category}</span>
                                  <button
                                    onClick={() => removeCategory(index)}
                                    className="px-2 py-1 bg-red-500 text-white rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="Amenity"
                          className="block mb-1 text-sm font-medium text-gray-700"
                        >
                          Amenity
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="text"
                            value={currentAmenity}
                            onChange={(e) => setCurrentAmenity(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add Amenity"
                          />
                          <button
                            onClick={addAmenity}
                            className="px-4 w-20 bg-black h-8 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Add
                          </button>
                        </div>
                        <div className="mt-4">
                          {amenities.length > 0 && (
                            <ul className="list-disc list-inside space-y-2">
                              {amenities.map((amenity, index) => (
                                <li
                                  key={index}
                                  className="flex items-center justify-between text-gray-700"
                                >
                                  <span>{amenity}</span>
                                  <button
                                    onClick={() => removeAmenity(index)}
                                    className="px-2 py-1 bg-red-500 text-white rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2  gap-7">
                      <div>
                        <label
                          htmlFor="date"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Start Date
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            id="date"
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Select Event Date"
                            value={startDate}
                            onChange={(e) => setDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="date"
                          className="block text-sm font-medium text-gray-700"
                        >
                          End Date
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            id="date"
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Select Event Date"
                            value={endDate}
                            onChange={(e) => setendDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid   grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="event-image"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Event Image
                        </label>
                        <div className="mt-1">
                          <input
                            type="file"
                            id="event-image"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="idcard-image"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Id Card Background Image
                        </label>
                        <div className="mt-1">
                          <input
                            type="file"
                            id="idcard-image"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex  items-center justify-between  pt-5 gap-10">
                      <button
                        type="button"
                        onClick={toggleModal}
                        className="inline-flex  w-full items-center justify-center whitespace-nowrap text-sm font-medium bg-gray-200 text-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-2 inline-flex bg-black w-full justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        disabled={isCreating} // Disable button when loading
                      >
                        {isCreating ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 mr-3 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.291A7.97 7.97 0 014 12H2c0 2.21.896 4.21 2.343 5.657l1.414-1.366z"
                              ></path>
                            </svg>
                            Creating...
                          </>
                        ) : (
                          "Create"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Events</h1>

        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <span className="loader"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.isArray(events) &&
              events
                .slice()
                .reverse()
                .map((event) => (
                  <div
                    key={event._id}
                    className="relative h-64 cursor-pointer overflow-hidden rounded-lg"
                  >
                    <img
                      src={
                        event.photoUrl ||
                        "https://www.cvent.com/sites/default/files/styles/focus_scale_and_crop_800x450/public/image/2019-10/48980241783_2b57e5f535_k.jpg?h=a1e1a043&itok=TvObf6VQ"
                      }
                      alt={event.eventName}
                      className="w-full h-full object-cover"
                      width="600"
                      height="400"
                      style={{ aspectRatio: "600/400", objectFit: "cover" }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex gap-4 justify-between">
                        <button className="bg-orange-600 text-white py-4  p-3 h-6 shadow-full flex items-center rounded-full font-bold">
                          {event.participantCount}
                        </button>
                        <div className="flex gap-3">
                          <button
                            onClick={() => toggleEditModal(event._id)}
                            className=" text-white p-3 bg-orange-600 rounded-full hover:bg-gray-400"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="currentColor"
                              class="bi bi-pencil-square"
                              viewBox="0 0 16 16"
                            >
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                              <path
                                fill-rule="evenodd"
                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDelete(event._id)}
                            className="text-white p-3 bg-orange-600 rounded-full hover:bg-gray-400"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="currentColor"
                              class="bi bi-trash3"
                              viewBox="0 0 16 16"
                            >
                              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              handleTaskView(event._id, event.eventName)
                            }
                            className=" p-3 bg-orange-600 font-bold text-white rounded  hover:bg-gray-400"
                          >
                            View Tasks
                          </button>
                        </div>
                        {showEditModal === event._id && (
                          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <EditEvents
                              event={event}
                              onClose={() => setActiveEventId(null)}
                              fetchEvents={fetchEvents}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex h-full flex-col justify-end">
                        <h3 className="text-3xl mb-1 font-bold text-white">
                          {event.eventName}
                        </h3>
                        <div className=" items-center gap-2 mb-8 shadow-full text-sm text-white">
                          <div className="font-semibold flex  border p-1 items-center gap-2  rounded-sm bg-slate-200 text-black">
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
                              className="h-4 w-4"
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

                            <span className="">
                              {new Date(event.startDate).toDateString()}{" "}
                              <strong>To</strong>{" "}
                              {new Date(event.endDate).toDateString()}
                            </span>
                          </div>
                          <div className="font-semibold border my-2 p-1 gap-2 flex  items-center px-2 rounded-sm bg-slate-200 text-black">
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
                              className="h-4 w-4"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>{event.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventPage;
