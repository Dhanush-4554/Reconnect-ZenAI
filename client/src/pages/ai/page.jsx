import React, { useState, useEffect, useRef } from 'react';

const Ai = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const startRecording = () => {
    setIsRecording(true);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      console.log('Recording started');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      console.log('Recording stopped');
    }
  };

  const sendToServer = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('File uploaded successfully');
      } else {
        setMessage('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file');
    }
  };

  useEffect(() => {
    const startMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
  
        // Define available codecs
        const options = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4' // Some browsers support mp4
        ];
  
        let mimeType = options.find(type => MediaRecorder.isTypeSupported(type)) || '';
  
        if (!mimeType) {
          console.error('No supported mimeType found');
          setMessage('Error: Unsupported media type');
          return;
        }
  
        console.log(`Using mimeType: ${mimeType}`);
  
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        let localChunks = [];
  
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            localChunks.push(event.data);
          }
        };
  
        mediaRecorder.onstop = () => {
          const blob = new Blob(localChunks, { type: mimeType });
          sendToServer(blob);
          localChunks = [];
        };
  
        mediaRecorderRef.current = mediaRecorder;
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setMessage('Error accessing media devices.');
      }
    };
  
    startMediaStream();
  }, []);
  
  return (
    <div className="ai-container">
      <div className="video-container">
        <h1 className="title">AI Interaction</h1>
        <div className="video-section">
          <video ref={videoRef} className="video" autoPlay playsInline></video>
        </div>
        <div>
          {!isRecording ? (
            <button onClick={startRecording}>Start Recording</button>
          ) : (
            <button onClick={stopRecording}>Stop Recording</button>
          )}
        </div>
        <p className="status">{isRecording ? 'Recording...' : 'Not recording'}</p>
        <p className="status">{message}</p>
      </div>
    </div>
  );
};

export default Ai;
