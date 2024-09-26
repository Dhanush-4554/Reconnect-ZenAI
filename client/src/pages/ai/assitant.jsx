import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import './assistant.css';
import axios from 'axios'

const FaceEmotionDetection = () => {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setTimeout(() => {
        generateAiResponse(transcript, emotion);
      }, 500);
      setIsRecording(false);
    }
  };

  const generateAiResponse = async (inputMessage, videoEmotion) => {
    try {
      setIsLoading(true);
      console.log(inputMessage);

      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          emotion:videoEmotion // Only send the new message to the server
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.response; // Access the full AI response from the response body

        setResponse(result); // Update the state with the full response
        fetchAndPlayAudio(result); // Add the full response to the speech buffer
      } else {
        setError('Failed to fetch response from AI');
      }
    } catch (error) {
      setError('An error occurred while fetching the response.');
    } finally {
      setIsLoading(false);
    }
  };

  //sk_21320ddfcc940a85398ff696f757e74ffefe83a69d54b76a
  const fetchAndPlayAudio = async (text) => {
    console.log(text);
  
    const voiceId = 'cgSgspJ2msm6clMCkdW9';
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;
    const apiKey = 'sk_21320ddfcc940a85398ff696f757e74ffefe83a69d54b76a';
  
    const data = {
      text: text,
      voice_settings: {
        stability: 0.1,
        similarity_boost: 0.3,
      },
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify(data),
      });
  
      if (response.body) {
        const reader = response.body.getReader();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBufferQueue = [];
        let isPlaying = false;
        let isFirstPlayback = true; // New flag for first-time check
  
        // Buffer at least 3 chunks for the first playback only
        const MIN_BUFFERED_CHUNKS = 5;
  
        const processChunk = async () => {
          const { done, value } = await reader.read();
          if (done) {
            console.log('All audio chunks processed.');
            return;
          }
  
          console.log('Received chunk:', value);
  
          // Decode and queue the audio chunk
          try {
            const audioBuffer = await audioContext.decodeAudioData(value.buffer);
            audioBufferQueue.push(audioBuffer);
  
            // Check if it's the first time playing, buffer minimum chunks
            if (isFirstPlayback) {
              if (audioBufferQueue.length >= MIN_BUFFERED_CHUNKS && !isPlaying) {
                isFirstPlayback = false; // Disable the first-time check after starting playback
                playNextChunk();
              }
            } else {
              // For subsequent chunks, start playback as soon as one is available
              if (!isPlaying) {
                playNextChunk();
              }
            }
          } catch (error) {
            console.error('Error decoding audio chunk:', error);
          }
  
          // Continue reading the next chunk
          processChunk();
        };
  
        const playNextChunk = () => {
          if (audioBufferQueue.length === 0) {
            isPlaying = false;
            return;
          }
  
          isPlaying = true;
          const nextBuffer = audioBufferQueue.shift();
          const chunkSource = audioContext.createBufferSource();
          chunkSource.buffer = nextBuffer;
          chunkSource.connect(audioContext.destination);
  
          chunkSource.onended = () => {
            isPlaying = false;
            playNextChunk(); // Play the next chunk
          };
  
          chunkSource.start(); // Start playback of the current chunk
        };
  
        // Start processing chunks immediately
        processChunk();
      }
    } catch (error) {
      console.error('Error fetching audio:', error);
    }
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
    };
  }, []);


  return (
    <div className="container">
      <div className="main-content">
        {/* Left Section: Video */}
        <div className="left-section">
          <div className="video-container">
            <video ref={videoRef} autoPlay muted width="100%" height="auto" />
            <div className="transcript-caption">{transcript}</div>
          </div>
        </div>

        {/* Right Section: Jelly Circle */}
        <div className="right-section">
          <div className="circle-container">
            {isLoading ? (
              <div class="circle">
                <div class="container10">
                  <div class="line layer-1"></div>
                  <div class="line layer-2"></div>
                  <div class="line layer-3"></div>
                  <div class="line layer-4"></div>
                  <div class="line layer-5"></div>
                </div>
              </div>
            ) : (
              <div class="circle">
                <div class="container10">
                  <div class="line layer-1"></div>
                  <div class="line layer-2"></div>
                  <div class="line layer-3"></div>
                  <div class="line layer-4"></div>
                  <div class="line layer-5"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Bottom Controls: Start and Stop Recording Buttons */}
      <div className="controls">
        <button onClick={startRecording} disabled={isRecording}>
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
      </div>
    </div>
  );
};

export default FaceEmotionDetection;
