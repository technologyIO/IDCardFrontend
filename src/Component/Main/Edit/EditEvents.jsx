import React, { useState, useEffect } from "react";

function EditEvents({ toggleEditModal, event, fetchEvents, id, onClose }) {
  const [eventName, setEventName] = useState(event.eventName || "");
  const [address, setAddress] = useState(event.address || "");
  const [startDate, setStartDate] = useState(event.startDate || "");
  const [endDate, setEndDate] = useState(event.endDate || "");
  const [categories, setCategories] = useState(event.categories || []);
  const [amenities, setAmenities] = useState(event.amenities || {});
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentAmenity, setCurrentAmenity] = useState("");
  const [eventImage, setEventImage] = useState(null);
  const [idCardImage, setIdCardImage] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setAmenities(event.amenities || {});
  }, [event.amenities]);

  const addCategory = (e) => {
    e.preventDefault(); // Prevent form submission
    if (currentCategory.trim()) {
      setCategories((prevCategories) => [
        ...prevCategories,
        currentCategory.trim(),
      ]);
      setCurrentCategory("");
    }
  };

  const addAmenity = (e) => {
    e.preventDefault(); // Prevent form submission
    if (currentAmenity.trim() !== "" && !amenities[currentAmenity]) {
      setAmenities((prevAmenities) => ({
        ...prevAmenities,
        [currentAmenity]: true,
      }));
      setCurrentAmenity("");
    }
  };

  const removeCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const removeAmenity = (key) => {
    setAmenities((prevAmenities) => {
      const updatedAmenities = { ...prevAmenities };
      delete updatedAmenities[key];
      return updatedAmenities;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData();
    formData.append("eventName", eventName);
    formData.append("address", address);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("categories", JSON.stringify(categories));
    formData.append("amenities", JSON.stringify(amenities));
    if (eventImage) formData.append("photo", eventImage);
    if (idCardImage) formData.append("idcardimage", idCardImage);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/events/edit/${event._id}`,
        {
          method: "PATCH",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Event updated successfully");
        onClose();
        fetchEvents();
      } else {
        console.error("Error updating event:", await response.text());
      }
    } catch (error) {
      console.error("Error updating event:", error);
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
        <div className="relative p-4 w-full max-w-4xl max-h-full">
          <div className="relative bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Update Event
                </h1>
              </div>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                onClick={onClose}
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
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter Event Name"
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
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter Address"
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
                          type="button" // Prevent form submission
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
                                  type="button" // Prevent form submission
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
                          type="button" // Prevent form submission
                          onClick={addAmenity}
                          className="px-4 w-20 bg-black h-8 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Add
                        </button>
                      </div>
                      <div className="mt-4">
                        {Object.keys(amenities).length > 0 && (
                          <ul className="list-disc list-inside space-y-2">
                            {Object.keys(amenities).map((key) => (
                              <li
                                key={key}
                                className="flex items-center justify-between text-gray-700"
                              >
                                <span>{key}</span>
                                <button
                                  type="button" // Prevent form submission
                                  onClick={() => removeAmenity(key)}
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

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    <div>
                      <label
                        htmlFor="eventImage"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Event Image
                      </label>
                      <input
                        type="file"
                        id="eventImage"
                        onChange={(e) => setEventImage(e.target.files[0])}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="idCardImage"
                        className="block text-sm font-medium text-gray-700"
                      >
                        ID Card Image
                      </label>
                      <input
                        type="file"
                        id="idCardImage"
                        onChange={(e) => setIdCardImage(e.target.files[0])}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={isCreating}
                    >
                      {isCreating ? "Updating..." : "Update Event"}
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

export default EditEvents;
