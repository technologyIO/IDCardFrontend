import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import IdCardrender from "./IdCardrender";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { toPng } from "html-to-image";
import JsBarcode from "jsbarcode";
function CreateId() {
  const location = useLocation();
  const [modal, setModal] = useState(false);
  const [linkmodal, setlinkmodal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [idCard, setIdCard] = useState([]);
  const [designations, setDesignations] = useState([]); // State to hold fetched designations
  const [Dataid, setDataid] = useState("");
  const [params, setparams] = useState(new URLSearchParams(location.search));
  const [eventId, setEventId] = useState(params.get("eventid"));
  const [eventName, setEventName] = useState("");
  const [institute, setInstitute] = useState("");
  const [email, setemail] = useState("");
  const [selectedIdCardType, setSelectedIdCardType] = useState("vertical");
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [amenities, setamenities] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  const handleCopy = () => {
    navigator.clipboard
      .writeText(generatedLink)
      .then(() => setCopySuccess("Copied!"))
      .catch(() => setCopySuccess("Failed to copy!"));
  };
  const handleImageChange = (event) => {
    const { id, files } = event.target;
    if (files && files[0]) {
      const file = files[0];
      if (id === "profilePicture") {
        setProfilePicture(file);
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("eventid");
    const name = params.get("eventName");
    setparams(params);
    setEventId(id);
    setEventName(name);

    fetchData();
  }, [location]);

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

  const [isCreating, setIsCreating] = useState(false); // New state for loading spinner
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsCreating(true); // Start loading spinner

    try {
      const formData = new FormData();

      // Append non-file data
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("designation", designation);
      formData.append("idCardType", selectedIdCardType);
      formData.append("institute", institute);
      formData.append("eventId", eventId);
      formData.append("eventName", eventName);
      formData.append("email", email);

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

      // Update state with the new participant data
      setIdCard([...idCard, response.data]);
      fetchData(eventId); // Refetch data as needed
      toggleModal(); // Close modal if needed
      toast.success("ID card created successfully!", "Success");
    } catch (error) {
      console.error("Error creating participant:", error);
    } finally {
      setIsCreating(false); // Stop loading spinner
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (index) => {
    setIsLoading(true);
    const idCardElement = document.getElementById(`id-card-${index}`);
    const downloadButton = document.getElementById(`download-button-${index}`);

    if (!idCardElement || !downloadButton) {
      console.error("Element not found");
      return;
    }

    downloadButton.style.display = "none";

    try {
      const dataUrl = await toPng(idCardElement, { quality: 1, pixelRatio: 4 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "id-card.png";
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    } finally {
      setIsLoading(false);
      downloadButton.style.display = "block";
    }
  };
  const handleDownloadAll = async (data) => {
    setIsLoading(true);
    const zip = new JSZip();

    for (let index = 0; index < data.length; index++) {
      const card = data[index];
      const idCardElement = document.getElementById(`id-card-${index}`);

      if (!idCardElement) {
        console.error("Element not found", index);
        continue;
      }

      try {
        const dataUrl = await toPng(idCardElement, {
          quality: 1,
          pixelRatio: 4,
        });
        const base64Data = dataUrl.split("base64,")[1];
        zip.file(`id-card-${index + 1}.png`, base64Data, { base64: true });
      } catch (error) {
        console.error("Error generating PNG:", error, index);
      }
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "id-cards.zip");
      setIsLoading(false);
    });
  };

  const handleDownloadWithoutBackground = async (index) => {
    setIsLoading(true);
    const idCardElement = document.getElementById(`id-card-${index}`);
    const downloadButton = document.getElementById(`download-button-${index}`);

    if (!idCardElement || !downloadButton) {
      console.error("Element not found");
      setIsLoading(false);
      return;
    }

    const originalBackground = idCardElement.style.backgroundImage;
    idCardElement.style.backgroundImage = "none"; // Remove background image

    downloadButton.style.display = "none";

    try {
      const dataUrl = await toPng(idCardElement, { quality: 1, pixelRatio: 4 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "id-card-without-bg.png";
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    } finally {
      idCardElement.style.backgroundImage = originalBackground; // Restore background image
      downloadButton.style.display = "block";
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setBackgroundImage(designations[0]?.idcardimage);
  }, [designations]);
  useEffect(() => {
    // Assuming `designations` is an array and you are filtering for a specific event
    const eventDesignations = designations.find((d) => d._id === eventId);
    if (eventDesignations) {
      setamenities(eventDesignations.amenities || {});
    }
  }, [designations, eventId]);

  console.log("backgroundImage", backgroundImage);
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, idCard.participantId, {
        format: "CODE128",
        displayValue: true,
        height: 60, // Adjust the height here as needed
      });
    }
  }, [idCard.participantId]);
  // Function to fetch designations from API
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
  console.log("categories", designations);

  // useEffect(() => {
  //   // Pass the eventid you want to filter by
  // }, [eventId]);

  const navigate = useNavigate();

  const toggleModal = () => {
    setModal(!modal);
    fetchDesignations(eventId);
  };
  const toggleLinkModal = () => {
    setlinkmodal(!linkmodal);
  };

  const handleNavigate = () => {
    navigate(`/bulk-create-id?eventid=${eventId}&eventName=${eventName}`);
  };
  const handleNavigatearchive = () => {
    navigate(`/archive-id-card?eventid=${eventId}&eventName=${eventName}`);
  };
  const handleEmbed = () => {
    navigate(`/form-url?eventid=${eventId}&eventName=${eventName}`);
  };

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

  const [generatedLink, setGeneratedLink] = useState("");

  const handleGenerateLink = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants/generate-token`,
        {
          eventId,
          eventName,
        }
      );
      const token = response.data.token;
      const link = `${window.location.origin}/form-url?eventid=${eventId}&eventName=${eventName}&token=${token}`;
      setGeneratedLink(link);
    } catch (error) {
      console.error("Error generating link:", error);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-50 w-full bg-gray-200 shadow-sm">
        <div className="flex h-16 mx-auto items-center justify-between px-4 lg:px-[80px]">
          <div className="hidden lg:block">
            <a className="flex items-center  gap-2" href="/event" rel="ugc">
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
              <span className="font-bold tracking-tight ">
                Event ID Card Generator App
              </span>
            </a>
          </div>
          <div className="flex lg:gap-10 gap-4">
            <button
              onClick={() => toggleLinkModal()}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium bg-black text-white transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
            >
              Embed Form
            </button>
            <button
              onClick={toggleModal}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium bg-black text-white transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
            >
              Create ID
            </button>
            <button
              onClick={handleNavigate}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium bg-black text-white transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
            >
              Bulk Create
            </button>
            <button
              onClick={handleNavigatearchive}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium bg-black text-white transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
            >
              Archive ID Card
            </button>
          </div>
        </div>
      </header>
      {linkmodal && (
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
                    Create Form Url
                  </h1>
                </div>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                  onClick={toggleLinkModal}
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
              <div className="w-full max-w-2xl mx-auto py-5 px-4 sm:px-6 lg:px-8 overflow-y-auto  sm:max-h-screen">
                <div className="space-y-6">
                  <h2 className="text-center">Generate Secure Form Link</h2>
                  <div className="border p-2 ">
                    Event ID :-
                    <input
                      type="text"
                      placeholder="Event ID"
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                    />
                  </div>
                  <div className="border p-2 ">
                    Event Name :-
                    <input
                      type="text"
                      placeholder="Event Name"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />{" "}
                  </div>
                  <div className="flex justify-center  ">
                    <button
                      className="bg-blue-500 font-bold text-white p-2 px-4 rounded-md  hover:bg-blue-600"
                      onClick={handleGenerateLink}
                    >
                      Generate Link
                    </button>
                  </div>

                  {generatedLink && (
                    <div className="border w-full shadow rounded  text-wrap overflow-auto p-4">
                      <h3>Generated Link:</h3>
                      <a
                        href={generatedLink}
                        target="_blank"
                        className="text-wrap block truncate "
                        rel="noopener noreferrer"
                      >
                        {generatedLink}
                      </a>
                      <div className="flex  justify-center">
                        <div className="">
                          <button
                            onClick={handleCopy}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Copy Link
                          </button>
                          {copySuccess && (
                            <p className="mt-2 text-green-500 text-center">
                              {copySuccess}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal && (
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
                      Create ID
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
                <div className="w-full max-w-2xl mx-auto py-5 px-4 sm:px-6 lg:px-8 overflow-y-auto h-[450px] sm:max-h-screen">
                  <div className="space-y-6">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="startname"
                            className="block text-sm font-medium text-gray-700"
                          >
                            First Name
                          </label>
                          <div className="mt-1">
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
                      <div>
                        <label
                          htmlFor="lastname"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email
                        </label>
                        <div className="mt-1">
                          <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            id="email"
                            placeholder="Enter your Email"
                            
                            value={email}
                            onChange={(e) => setemail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid-cols-2 grid  gap-6">
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
                              // required
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
                              // required
                              value={designation}
                              onChange={(e) => setDesignation(e.target.value)}
                            >
                              <option value="">Select Designation</option>
                              {designations.map((designation) =>
                                designation.categories.map(
                                  (category, index) => (
                                    <option key={index} value={category}>
                                      {category}
                                    </option>
                                  )
                                )
                              )}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-6 ">
                        <input
                          className="border p-2 rounded"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(e, setBackgroundImage)
                          }
                          disabled={isWebcamEnabled}
                        />
                        <WebcamCapture onCapture={handleCapture} />
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
                        )}
                      </div>
                      <div className="flex justify-between gap-5">
                        <button
                          type="button"
                          className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-black bg-gray-400 border border-transparent rounded-md hover:bg-gray-500 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={toggleModal}
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
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <span class="loader"></span>
        </div>
      ) : (
        <div className="my-10">
          <IdCardrender
            fetchData={fetchData}
            isLoading={isLoading}
            Dataid={Dataid}
            eventName={eventName}
            handleDownload={handleDownload}
            handleDownloadAll={handleDownloadAll}
            handleDownloadWithoutBackground={handleDownloadWithoutBackground}
            fetchDesignations={fetchDesignations}
            eventId={eventId}
          />
        </div>
      )}
    </div>
  );
}

export default CreateId;
