import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BulkUploadForm = () => {
  const [file, setFile] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [params, setParams] = useState(new URLSearchParams());
  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [amenities, setamenities] = useState(null);
  const fetchDesignations = async (eventId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events`);
      const filteredDesignations = response.data.find(
        (event) => event._id === eventId
      );
      setDesignations(filteredDesignations ? [filteredDesignations] : []);
      if (filteredDesignations) {
        setBackgroundImage(filteredDesignations.idcardimage);
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
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
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("eventid");
    const name = params.get("eventName");
    setParams(params);
    setEventId(id);
    setEventName(name);
  }, [location]);

  useEffect(() => {
    if (eventId) {
      fetchDesignations(eventId);
    }
  }, [eventId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select an Excel file.");
      return;
    }

    setLoading(true); // Start loader

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error("No sheets found in the uploaded file.");
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          throw new Error(`Sheet '${sheetName}' not found in the workbook.`);
        }

        const rows = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
          throw new Error("No data found in the sheet.");
        }

        const formData = new FormData();
        formData.append("participants", JSON.stringify(rows));
        formData.append("eventId", eventId);
        formData.append("eventName", eventName);
        formData.append("backgroundImage", backgroundImage);
        const amenitiesObject = typeof amenities === "object" ? amenities : {};
        formData.append("amenities", JSON.stringify(amenitiesObject));

        // Log the FormData contents
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/participants/bulk-upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setMessage("File uploaded successfully.");
        toast.success("File uploaded successfully.");
        console.log("Bulk upload result:", response.data);
        navigate(-1);
      } catch (error) {
        setMessage("Error uploading file.");
        console.error("Error in bulk upload:", error);
      } finally {
        setLoading(false); // Stop loader
      }
    };

    reader.onerror = (error) => {
      setMessage("Error reading file.");
      console.error("File reading error:", error);
      setLoading(false); // Stop loader
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="container mx-auto p-4 relative">
      {loading && (
        <div className="flex justify-center items-center h-[60vh]">
          <span class="loader"></span>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">Bulk Upload Participants</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="fileInput"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Select Excel File:
          </label>
          <input
            type="file"
            id="fileInput"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default BulkUploadForm;
