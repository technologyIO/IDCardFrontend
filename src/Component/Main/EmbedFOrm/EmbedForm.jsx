import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Webcam from "react-webcam";
function EmbedForm() {
  const location = useLocation();
  const [params, setparams] = useState(new URLSearchParams(location.search));
  const [eventId, setEventId] = useState(params.get("eventid"));
  const [Dataid, setDataid] = useState("");
  const [loading, setLoading] = useState(true);
  const [amenities, setamenities] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [idCard, setIdCard] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [isCreating, setIsCreating] = useState(false); // New state for loading spinner
  const [eventName, setEventName] = useState("");
  const [institute, setInstitute] = useState("");
  const [selectedIdCardType, setSelectedIdCardType] = useState("vertical");
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  useEffect(() => {
    // Assuming `designations` is an array and you are filtering for a specific event
    const eventDesignations = designations.find((d) => d._id === eventId);
    if (eventDesignations) {
      setamenities(eventDesignations.amenities || {});
    }
  }, [designations, eventId]);
  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
    setIsWebcamEnabled(false);
  };
  const handleCapture = (imageSrc) => {
    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    setProfilePicture(blob);
    setIsWebcamEnabled(false);
  };
  const handleRemovePicture = () => {
    setProfilePicture(null);
    setIsWebcamEnabled(false);
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("eventid");
    const name = params.get("eventName");
    setparams(params);
    setEventId(id);
    setEventName(name);
  }, [location]);
  const WebcamCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [capturing, setCapturing] = useState(false);

    const capture = useCallback(() => {
      const imageSrc = webcamRef.current.getScreenshot();
      onCapture(imageSrc);
      setCapturing(false);
    }, [webcamRef, onCapture]);

    return (
      <div className="border p-2 bg-gray-600  rounded text-center">
        {capturing ? (
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
            />
            <button
              className="bg-gray-300 hover:bg-gray-500 px-2 mt-2 rounded  txt-white "
              onClick={capture}
            >
              Capture
            </button>
          </div>
        ) : (
          <div
            onClick={() => setCapturing(true)}
            className=" flex justify-center text-center items-center gap-2 cursor-pointer  font-semibold  text-white text-lg  "
          >
            <button className="flex items-center gap-2 ">
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                class="bi bi-camera "
                viewBox="0 0 16 16"
              >
                <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
                <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
              </svg>
              Take Picture
            </button>
          </div>
        )}
      </div>
    );
  };
  const fetchDesignations = async (eventId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events`
      );
      const filteredDesignations = response.data.filter(
        (categories) => categories._id === eventId
      );
      setDesignations(filteredDesignations);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };
  useEffect(() => {
    if (eventId) {
      fetchDesignations(eventId);
    }
  }, [eventId]); // Only run this effect when eventId changes
  const fetchData = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/participants/event/${eventId}`;
      const response = await axios.get(url);
      console.log("Participants by EventId:", response.data); // Log fetched participants
      setDataid(response.data); // Update state with fetched data
      setLoading(false);
    } catch (error) {
      console.error("Error fetching participants by eventId:", error);
      setDataid([]); // Clear state or handle error case
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsCreating(true); // Start loading spinner

    try {
      const formData = new FormData();

      // Append non-file data
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("designation", designation);
      formData.append("institute", institute);
      formData.append("eventId", eventId);
      formData.append("eventName", eventName);
      formData.append("idCardType", selectedIdCardType);
      // Ensure amenities is an object and convert it to JSON
      const amenitiesObject = typeof amenities === "object" ? amenities : {};
      formData.append("amenities", JSON.stringify(amenitiesObject));

      // Append file data
      if (backgroundImage) {
        formData.append("backgroundImage", backgroundImage);
      }

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      // Send POST request
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIdCard([...idCard, response.data]);
      toast.dismiss()
      toast.success("ID card created successfully!", "Success");
    } catch (error) {
      console.error("Error creating participant:", error);
    } finally {
      setIsCreating(false); // Stop loading spinner
    }
  };
  useEffect(() => {
    setBackgroundImage(designations[0]?.idcardimage);
  }, [designations]);

  useEffect(() => {
    const verifyToken = async () => {
      const token = params.get("token");
      if (!token) {
        toast.dismiss()
        toast.error("No token provided.");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/participants/verify-token`,
          {
            headers: { Authorization: token },
          }
        );

        if (response.status === 200) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          toast.dismiss()
          toast.error("Invalid token.");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsTokenValid(false);
        toast.dismiss()
        toast.error("Error verifying token.");
      }
    };

    verifyToken();
  }, [params]);

  if (!isTokenValid) {
    return (
      <div className="flex justify-center items-center mt-[200px]  ">
        {" "}
        <div className="border p-4 shadow ">
          <div className="flex justify-center items-center">
            <svg
              data-id="4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-12 text-red-500"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
          </div>

          <div className="text-center font-bold mb-3 mt-3 " >Form validation failed or expired.</div>
          <p>
            Your session has expired. Please ask again for Form url to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className=" flex items-center justify-center w-full h-full bg-white "
        >
            
          <div className=" p-4 w-full px-[150px] max-h-full">
            <div className="relative  rounded-lg ">
              
              
              <div className="w-full max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8  ">
                <div className="space-y-6">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className=" gap-6">
                      <div>
                        <label
                          htmlFor="startname"
                          className="block text-sm font-medium text-gray-700"
                        >
                          First Name
                        </label>
                        <div className="mt-1 mb-4">
                          <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            id="startname"
                            placeholder="Enter your First Name"
                            required
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
                          Last name
                        </label>
                        <div className="mt-1">
                          <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            id="lastname"
                            placeholder="Enter your Last name"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <div className="mt-4">
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
                            required
                            value={institute}
                            onChange={(e) => setInstitute(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
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
                            placeholder="Enter your Designation"
                            required
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                          >
                            <option value="">Select Designation</option>
                            {designations.map((designation) =>
                              designation.categories.map((category, index) => (
                                <option key={index} value={category}>
                                  {category}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                      <input
                        className="border p-2 rounded"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(e, setBackgroundImage)
                        }
                        disabled={isWebcamEnabled}
                      />
                      {/* <WebcamCapture onCapture={handleCapture} />
                      {profilePicture && (
                        <div className="text-center ">
                          <img
                            src={URL.createObjectURL(profilePicture)}
                            alt="Profile"
                          />
                          <button
                            type="button "
                            className="border bg-red-700 font-bold text-white    px-2 mt-1 rounded "
                            onClick={handleRemovePicture}
                          >
                            Remove Picture
                          </button>
                        </div>
                      )} */}
                    <div className="flex  gap-5">
                      
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
                          "Submit"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmbedForm;
