// WebcamCapture.js
import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
    setCapturing(false);
  }, [webcamRef, onCapture]);

  return (
    <div>
      {capturing ? (
        <div>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
          />
          <button onClick={capture}>Capture</button>
        </div>
      ) : (
        <button onClick={() => setCapturing(true)}>Take Picture</button>
      )}
    </div>
  );
};

export default WebcamCapture;
