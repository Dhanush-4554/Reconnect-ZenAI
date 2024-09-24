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

@app.route('/chat', methods=['POST'])
def chat_response():
    data = request.json
    user_message = data.get('message')
    
    if not user_message:
        return Response('No message provided', status=400)

    try:
        # Send the user's message to the AI and get the response in chunks
        responses = chat.send_message(user_message, stream=False)
        
        # Collect the response chunks into a complete response
        full_response = responses.text

        # Return the AI's full response to the client
        return Response(json.dumps({"response": full_response}), content_type='application/json')
    
    except Exception as e:
        return Response(f'Error occurred: {str(e)}', status=500)

if __name__ == '__main__':
    app.run(debug=True)
