import os
from pydub import AudioSegment
import speech_recognition as sr
from concurrent.futures import ThreadPoolExecutor
import time  # To log time
from transformers import pipeline  # Hugging Face pipeline for emotion detection

# Function to extract audio from a .webm video file and convert it to .wav
def extract_audio_from_webm(video_file_path, output_audio_path):
    audio = AudioSegment.from_file(video_file_path, format="webm")
    audio.export(output_audio_path, format="wav")

# Function to transcribe audio to text using speech recognition
def transcribe_audio_to_text(audio_file_path):
    recognizer = sr.Recognizer()
    
    with sr.AudioFile(audio_file_path) as source:
        audio = recognizer.record(source)

    try:
        text = recognizer.recognize_google(audio)
        return text
    except sr.UnknownValueError:
        return "Audio not clear enough to transcribe."
    except sr.RequestError:
        return "API request failed."

# Function to detect emotions using Hugging Face pipeline
def detect_emotions(audio_file_path):
    # Load the emotion recognition model
    emotion_recognition = pipeline(model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition")
    
    # Read the audio file for emotion detection
    with open(audio_file_path, 'rb') as f:
        audio_bytes = f.read()
    
    # Run the emotion recognition
    emotions = emotion_recognition(audio_bytes)
    return emotions

# Main function to handle both extraction and transcription
def process_video_and_extract_text(video_file_path):
    output_audio_path = os.path.splitext(video_file_path)[0] + ".wav"

    # Record the start time
    start_time = time.time()

    # Run extraction, transcription, and emotion detection in parallel
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Schedule the audio extraction
        extract_future = executor.submit(extract_audio_from_webm, video_file_path, output_audio_path)
        extract_future.result()  # Wait for extraction to complete before further steps

        # Once the audio is extracted, transcribe it and detect emotions in parallel
        transcript_future = executor.submit(transcribe_audio_to_text, output_audio_path)
        emotion_future = executor.submit(detect_emotions, output_audio_path)

        # Get the transcription and emotion results
        transcript = transcript_future.result()
        emotions = emotion_future.result()

    # Record the end time
    end_time = time.time()

    # Log the time taken
    time_taken = end_time - start_time
    print(f"Time taken for Audio execution: {time_taken:.2f} seconds")

    # Print results
    print(f"Audio  Emotions: {emotions}")

    return output_audio_path, transcript