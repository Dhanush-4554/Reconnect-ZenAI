from flask import Flask, request, Response
from flask_cors import CORS
import json
import vertexai
from vertexai.generative_models import GenerativeModel

# Initialize Flask app and CORS
app = Flask(__name__)
CORS(app)

# Initialize Vertex AI and Gemini model
vertexai.init(project="zenai-436617", location="us-central1")
model = GenerativeModel("gemini-1.5-flash-001")

# Create a chat session at the global level so the context is preserved
chat = model.start_chat()

# Define a therapeutic prompt template once when the server loads
therapist_prompt_template = (
    "Imagine you are a mental health therapist. The user has come to you seeking help. "
    "Respond with short, concise answers that are direct and to the point. "
    "When the user asks for what to do or requests suggestions, then only give long answers. "
    "Be encouraging, supportive, and non-judgmental."
)

# Load the initial therapist prompt (optional)
load = chat.send_message(therapist_prompt_template, stream=False)
print(load.text)

@app.route('/chat', methods=['POST'])
def chat_response():
    data = request.json
    user_message = data.get('message')
    emotion = data.get('emotion')  # Receive the emotion from the client

    if not user_message:
        return Response('No message provided', status=400)
    
    if not emotion:
        return Response('No emotion provided', status=400)

    try:
        # Construct the prompt by combining the therapist prompt template with the user's message and emotion
        full_prompt = f"User's message: {user_message}\nFace Emotion: {emotion}. Respond accordingly."
        print(full_prompt)

        # Send the constructed prompt to Vertex AI and get the response
        responses = model.generate_content([full_prompt])

        # Collect the AI's response
        full_response = responses.text

        # Return the AI's full response to the client
        return Response(json.dumps({"response": full_response}), content_type='application/json')
    
    except Exception as e:
        return Response(f'Error occurred: {str(e)}', status=500)

if __name__ == '__main__':
    app.run(debug=True)
