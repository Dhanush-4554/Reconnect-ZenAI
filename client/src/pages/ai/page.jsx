import React, { useState, useEffect, useRef } from 'react';

const Ai = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [audioEmotions, setAudioEmotions] = useState(null);
  const [videoEmotion, setVideoEmotion] = useState(null);
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const speechSynthesisRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const speechBufferRef = useRef('');
  const isSpeakingRef = useRef(false);

  // Starts the recording
  const startRecording = () => {
    setIsRecording(true);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      console.log('Recording started');
    }
  };

  // Stops the recording
  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      console.log('Recording stopped');
    }
  };

  // Helper to update conversation history
  const updateConversationHistory = (data, aiResponse = '') => {
    const newHistoryEntry = {
      role: 'user', 
      content: data.transcript,
      audio_emotions: data.audio_emotions,
      video_emotion: data.dominant_video_emotion,
    };
  
    setConversationHistory((prevHistory) => [
      ...prevHistory,
      newHistoryEntry,
      { role: 'ai', content: aiResponse }, // Add AI response to history
    ]);
  };

  // Creates the prompt to send to AI with user history
  const createPrompt = (inputMessage, conversationHistory) => {
    const historyText = conversationHistory
      .map(entry => (entry.role === 'user' 
        ? `User: "${entry.content}"` 
        : `AI: "${entry.content}"`))
      .join('\n');
  
    return `
      You are a caring and empathetic AI assistant. Respond to the user's input by considering their emotional state and previous interactions.
  
      Previous context:
      ${historyText}
      
      User's current input: "${inputMessage}"
  
      Keep your response concise and empathetic, around 2-3 sentences.
    `;
  };
  

  // Generates AI response using the prompt with history
  const generateAiResponse = async (inputMessage) => {
    try {
      const prompt = createPrompt(inputMessage, conversationHistory);
      console.log(prompt);
  
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.1:latest',
          prompt: prompt,
        }),
      });
  
      if (response.ok) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let result = '';
  
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
  
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.response) {
                  result += parsed.response;
                  setResponse(result);
                  addToSpeechBuffer(parsed.response);
                }
              } catch (err) {
                console.error('Error parsing JSON', err);
              }
            }
          }
  
          buffer = lines[lines.length - 1];
        }
  
        if (buffer) {
          try {
            const parsed = JSON.parse(buffer);
            if (parsed.response) {
              result += parsed.response;
              setResponse(result);
              addToSpeechBuffer(parsed.response);
            }
          } catch (err) {
            console.error('Error parsing final JSON', err);
          }
        }
  
        // Update the conversation history with both user input and AI response
        updateConversationHistory({ transcript: inputMessage }, result);
      } else {
        setError('Failed to fetch response from AI');
      }
    } catch (error) {
      setError('An error occurred while fetching the response.');
    }
  };
  

  // Add to speech buffer and speak
  const addToSpeechBuffer = (text) => {
    speechBufferRef.current += text;
    if (!isSpeakingRef.current) {
      speakFromBuffer();
    }
  };

  // Speak from buffer
  const speakFromBuffer = () => {
    if (speechBufferRef.current.length > 0) {
      isSpeakingRef.current = true;
      
      const sentences = speechBufferRef.current.match(/[^.!?]+[.!?]+|\S+/g) || [];
      
      if (sentences.length > 0) {
        const sentenceToSpeak = sentences[0].trim();
        speechBufferRef.current = speechBufferRef.current.slice(sentenceToSpeak.length).trim();

        utteranceRef.current = new SpeechSynthesisUtterance(sentenceToSpeak);
        utteranceRef.current.rate = 1.3;
        utteranceRef.current.onend = () => {
          isSpeakingRef.current = false;
          speakFromBuffer();
        };
        speechSynthesisRef.current.speak(utteranceRef.current);
      } else {
        isSpeakingRef.current = false;
      }
    } else {
      isSpeakingRef.current = false;
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
    }
    isSpeakingRef.current = false;
    speechBufferRef.current = '';
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);
  
  // Sends recorded data to server
  const sendToServer = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('File uploaded successfully');
        setTranscript(data.transcript);
        setAudioEmotions(data.audio_emotions);
        setVideoEmotion(data.dominant_video_emotion);

        updateConversationHistory(data);
        generateAiResponse(data.transcript);
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

        const options = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4',
        ];

        let mimeType = options.find((type) => MediaRecorder.isTypeSupported(type)) || '';

        if (!mimeType) {
          console.error('No supported mimeType found');
          setMessage('Error: Unsupported media type');
          return;
        }

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
        {transcript && (
          <div className="transcript-section">
            <h3>Transcript:</h3>
            <p>{transcript}</p>
          </div>
        )}
        {audioEmotions && (
          <div className="audio-emotions-section">
            <h3>Audio Emotions:</h3>
            <ul>
              {audioEmotions.map((emotion, index) => (
                <li key={index}>
                  {emotion.label}: {emotion.score.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {videoEmotion && (
          <div className="video-emotion-section">
            <h3>Dominant Video Emotion:</h3>
            <p>{videoEmotion}</p>
          </div>
        )}
        {response && (
          <div className="response-section">
            <h3>AI Response:</h3>
            <p>{response}</p>
          </div>
        )}
        {error && (
          <div className="error-section">
            <p className="error-message">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ai;
