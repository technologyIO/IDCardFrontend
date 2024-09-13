import React, { useState, useEffect } from "react";
import axios from "axios";

function EditParticipant({ toggleModal, id, eventId, fetchData, data }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [institute, setInstitute] = useState("");
  const [designation, setDesignation] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch designations based on eventId
  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events`
      );
      const event = response.data.find((event) => event._id === eventId);
      if (event) {
        setDesignations(event.categories || []);
      } else {
        console.error("Event not found");
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize form fields with data from props
  useEffect(() => {
    if (data) {
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setInstitute(data.institute || "");
      setDesignation(data.designation || "");
      setProfilePicture(null); // Optionally, you may want to handle this if needed
    }
  }, [data]);

  useEffect(() => {
    fetchDesignations();
  }, [eventId]);

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("institute", institute);
    formData.append("designation", designation);
    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/participants/participant/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toggleModal(); // Close modal on successful update
      fetchData();
    } catch (error) {
      console.error("Error updating participant:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div
        id="default-modal"
        tabIndex="-1"
        aria-hidden="true"
        className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
      >
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          <div className="relative bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Update Participant
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
            <div className="w-full max-w-2xl mx-auto py-5 px-4 sm:px-6 lg:px-8 overflow-y-auto h-[350px] sm:max-h-screen">
              <div className="space-y-6">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="firstname"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name
                      </label>
                      <div className="mt-1">
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="firstname"
                          placeholder="Enter your First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="lastname"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last Name
                      </label>
                      <div className="mt-1">
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="lastname"
                          placeholder="Enter your Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="">
                      <label
                        htmlFor="institute"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Institute
                      </label>
                      <div className="mt-1">
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="institute"
                          placeholder="Enter your Institute"
                          value={institute}
                          onChange={(e) => setInstitute(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="designation"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Designation
                      </label>
                      <div className="mt-1">
                        <select
                          className="flex h-10 w-[100%] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="designation"
                          placeholder="Select your Designation"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                        >
                          <option value="">Select Designation</option>
                          {designations.length === 0 ? (
                            <option value="" disabled>
                              No Designations Available
                            </option>
                          ) : (
                            designations.map((desig, index) => (
                              <option key={index} value={desig}>
                                {desig}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="profilePicture"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      id="profilePicture"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={toggleModal}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      disabled={isCreating}
                    >
                      {isCreating ? "Updating..." : "Update "}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditParticipant;
