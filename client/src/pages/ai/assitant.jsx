import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceEmotionDetection = () => {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const speechBufferRef = useRef('');
  const isSpeakingRef = useRef(false);
  const utteranceRef = useRef(null);
  const speechSynthesisRef = useRef(window.speechSynthesis);
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);

  // Load models required for face detection and emotion analysis
  const loadModels = async () => {
    const MODEL_URL = './models'; // Ensure models are served from the public folder
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
  };

  // Start video stream from user's webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error('Error accessing webcam:', err));
  };

  const detectEmotions = async () => {
    const video = videoRef.current;
    if (video && faceapi.nets.tinyFaceDetector.params) {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length > 0 && detections[0].expressions) {
        // Get the emotion with the highest probability
        const expressions = detections[0].expressions;
        const maxEmotion = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );
        setEmotion(maxEmotion);
      } else {
        setEmotion("No emotion detected");
      }
    }
  };

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.interimResults = true;
      recognition.continuous = true;
      
      recognition.onresult = event => {
        const result = event.results[event.results.length - 1][0].transcript;
        setTranscript(result);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = event => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    } else {
      console.error('SpeechRecognition API not supported.');
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setTimeout(()=>{
        generateAiResponse(transcript, emotion);
    }, 500);
      setIsRecording(false);
    }
  };

  // AI Response Generation and TTS Integration
  const generateAiResponse = async (inputMessage, videoEmotion) => {
    try {
      console.log(inputMessage);

      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage, // Only send the new message to the server
        }),
      });

      if (response.ok) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let result = '';

        // Stream processing
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the value and append to buffer
          buffer += decoder.decode(value, { stream: true });

          // Split buffer into lines
          const lines = buffer.split('\n');

          // Process each line except the last one (which might be incomplete)
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.chunk === '[DONE]') {
                  // Stop processing when "[DONE]" is received
                  return;
                }
                if (parsed.chunk) {
                  result += parsed.chunk; // Append the chunk to the result
                  console.log(result);
                  addToSpeechBuffer(parsed.chunk); // Add the new text to speech buffer
                  setResponse(result); // Update response state with partial result
                }
              } catch (err) {
                console.error('Error parsing JSON', err);
              }
            }
          }
          // Keep the last line in the buffer if it's incomplete
          buffer = lines[lines.length - 1];
        }
      } else {
        setError('Failed to fetch response from AI');
      }
    } catch (error) {
      setError('An error occurred while fetching the response.');
    }
  };

  const addToSpeechBuffer = (text) => {
    speechBufferRef.current += text; // Append new text to the buffer

    // Check if there's a complete sentence and no speech is ongoing
    if (!isSpeakingRef.current && hasCompleteSentence(speechBufferRef.current)) {
      speakFromBuffer(); // Start speaking if the buffer has a complete sentence
    }
  };

  const hasCompleteSentence = (text) => {
    const sentenceRegex = /[.!?]+/g;
    return sentenceRegex.test(text); // Check for complete sentences (ending with . ! or ?)
  };

  const speakFromBuffer = () => {
    if (isSpeakingRef.current || speechBufferRef.current.length === 0) {
      return; // Don't speak if already speaking or buffer is empty
    }

    // Extract the first complete sentence
    const sentenceToSpeak = extractFirstCompleteSentence(speechBufferRef.current);

    if (sentenceToSpeak) {
      isSpeakingRef.current = true;
      speechBufferRef.current = speechBufferRef.current.slice(sentenceToSpeak.length).trim(); // Remove the spoken sentence from buffer

      utteranceRef.current = new SpeechSynthesisUtterance(sentenceToSpeak);
      utteranceRef.current.rate = 1.3;

      utteranceRef.current.onend = () => {
        isSpeakingRef.current = false;
        speakFromBuffer(); // Continue with the next sentence after finishing the current one
      };

      speechSynthesisRef.current.speak(utteranceRef.current);
    }
  };

  const extractFirstCompleteSentence = (text) => {
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const match = text.match(sentenceRegex); // Extract the first complete sentence
    return match ? match[0].trim() : ''; // Ensure we return the first complete sentence
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
    }
    isSpeakingRef.current = false;
    speechBufferRef.current = ''; // Clear the speech buffer
  };

  useEffect(() => {
    // Load models and start the video when component mounts
    loadModels().then(startVideo);
    initializeSpeechRecognition();

    const emotionInterval = setInterval(() => {
      detectEmotions();
    }, 100); // Runs every 100 ms for real-time detection

    return () => {
      clearInterval(emotionInterval);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Real-Time Emotion Detection and AI Response</h2>
      <div style={{ display: 'inline-block' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          width="720"
          height="560"
          style={{ border: '1px solid black' }}
        />
      </div>
      <h3>Detected Emotion: {emotion}</h3>
      <div style={{ marginTop: '20px' }}>
        <button onClick={startRecording} disabled={isRecording}>
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        <button onClick={stopRecording} disabled={!isRecording} style={{ marginLeft: '10px' }}>
          Stop Recording
        </button>
      </div>
      <div style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>
        <h3>Transcribed Text:</h3>
        <p>{transcript}</p>
      </div>
      <div style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>
      {response && (
          <div className="response-section">
            <h3>AI Response:</h3>
            <p>{response}</p>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default FaceEmotionDetection;
