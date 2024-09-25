import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import './assistant.css';

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

  // AI Response Generation and TTS Integration
  // const generateAiResponse = async (inputMessage, videoEmotion) => {

  //   try {
  //     setIsLoading(true);
  //     console.log(inputMessage);

  //     const response = await fetch('http://localhost:5000/chat', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         message: inputMessage, // Only send the new message to the server
  //       }),
  //     });

  //     if (response.ok) {
  //       const reader = response.body.getReader();
  //       const decoder = new TextDecoder();
  //       let buffer = '';
  //       let result = '';

  //       // Stream processing
  //       while (true) {
  //         const { done, value } = await reader.read();
  //         if (done) break;

  //         // Decode the value and append to buffer
  //         buffer += decoder.decode(value, { stream: true });

  //         // Split buffer into lines
  //         const lines = buffer.split('\n');

  //         // Process each line except the last one (which might be incomplete)
  //         for (let i = 0; i < lines.length - 1; i++) {
  //           const line = lines[i].trim();
  //           if (line) {
  //             try {
  //               const parsed = JSON.parse(line);
  //               if (parsed.chunk === '[DONE]') {
  //                 // Stop processing when "[DONE]" is received
  //                 return;
  //               }
  //               if (parsed.chunk) {
  //                 result += parsed.chunk; // Append the chunk to the result
  //                 console.log(result);
  //                 addToSpeechBuffer(parsed.chunk); // Add the new text to speech buffer
  //                 setResponse(result); // Update response state with partial result
  //               }
  //             } catch (err) {
  //               console.error('Error parsing JSON', err);
  //             }
  //           }
  //         }
  //         // Keep the last line in the buffer if it's incomplete
  //         buffer = lines[lines.length - 1];
  //         setIsLoading(false)
  //       }
  //     } else {
  //       setError('Failed to fetch response from AI');
  //     }
  //   } catch (error) {
  //     setError('An error occurred while fetching the response.');
  //   }
  // };

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
          message: inputMessage, // Only send the new message to the server
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.response; // Access the full AI response from the response body

        setResponse(result); // Update the state with the full response
        addToSpeechBuffer(result); // Add the full response to the speech buffer
      } else {
        setError('Failed to fetch response from AI');
      }
    } catch (error) {
      setError('An error occurred while fetching the response.');
    } finally {
      setIsLoading(false);
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

    const sentenceToSpeak = extractFirstCompleteSentence(speechBufferRef.current);

    if (sentenceToSpeak) {
      isSpeakingRef.current = true;
      speechBufferRef.current = speechBufferRef.current.slice(sentenceToSpeak.length).trim();

      const jellyCircleElement = document.querySelector('.jelly-circle');
      jellyCircleElement.classList.add('vibrating'); // Start vibration effect

      utteranceRef.current = new SpeechSynthesisUtterance(sentenceToSpeak);
      utteranceRef.current.rate = 1.01; // Adjust the speaking rate

      // Select a female voice
      const voices = speechSynthesisRef.current.getVoices();
      const femaleVoice = voices.find(voice => voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman'));

      if (femaleVoice) {
        utteranceRef.current.voice = femaleVoice; // Set the female voice
      }

      utteranceRef.current.onend = () => {
        isSpeakingRef.current = false;
        jellyCircleElement.classList.remove('vibrating'); // Stop vibration effect
        speakFromBuffer(); // Continue with the next sentence
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

    speechSynthesisRef.current.onvoiceschanged = () => {
      // Optionally handle voice selection here
      console.log('Voices changed:', speechSynthesisRef.current.getVoices());
    };

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
              <div className="animation-container">
                <div className="jelly-circle"></div>
              </div>
            ) : (
              <div className="animation-container">
                <div className="jelly-circle"></div>
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
