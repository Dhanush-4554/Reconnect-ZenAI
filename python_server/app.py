from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from extract_audio_and_text import process_video_and_extract_text
from emotion_analysis import analyze_emotions_from_video
from concurrent.futures import ThreadPoolExecutor
import time

app = Flask(__name__)
CORS(app)

# Create an uploads folder to store video/audio files
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    if file:
        # Save the file to the uploads folder
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Create a ThreadPoolExecutor to run tasks in parallel
        with ThreadPoolExecutor(max_workers=3) as executor:
            start_time = time.time()
            
            # Submit tasks to executor
            extract_audio_future = executor.submit(process_video_and_extract_text, file_path)
            analyze_emotions_future = executor.submit(analyze_emotions_from_video, file_path)
            
            # Wait for the extraction and emotion analysis to complete
            audio_path, transcript = extract_audio_future.result()
            dominant_emotion, all_emotions = analyze_emotions_future.result()
            
            # Measure time taken
            end_time = time.time()
            time_taken = end_time - start_time
            
            print(f"Time Taken: {time_taken:.2f} seconds")
            print(f"Audio Path: {audio_path}")
            print(f"Transcript: {transcript}")
            print(f"Dominant Emotion: {dominant_emotion}")
            print(f"All Emotions: {all_emotions}")

            return jsonify({
                "message": "File processed successfully",
                "audio_path": audio_path,
                "transcript": transcript,
                "dominant_emotion": dominant_emotion,
                "all_emotions": all_emotions,
                "time_taken": f"{time_taken:.2f} seconds"
            }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
