from flask import Flask, request, jsonify
from langchain_community.llms import Ollama
from flask_cors import CORS
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

app = Flask(__name__)
CORS(app)

# Set up the LLM with LangChain (Ollama in this case)
llm = Ollama(model="llama3.1:latest")

from langchain_core.prompts.prompt import PromptTemplate

template = """The following is a friendly conversation between a human and an AI. The AI provides concise, specific responses. If the AI does not know the answer, it truthfully says it does not know.

Current conversation:
{history}
Human: {input}
AI Assistant:"""

PROMPT = PromptTemplate(input_variables=["history", "input"], template=template)
conversation = ConversationChain(
    prompt=PROMPT,
    llm=llm,
    verbose=True,
    memory=ConversationBufferMemory(ai_prefix="AI Assistant"),
)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    # Use the chain to get a response based on the current chat history
    response_message = conversation.invoke(user_message)
    
    # Ensure the response is correctly extracted, if it's a dictionary
    if isinstance(response_message, dict) and 'response' in response_message:
        extracted_response = response_message['response']
    else:
        extracted_response = response_message  # Or handle other formats

    print(extracted_response)
    
    return jsonify({'response': extracted_response})

if __name__ == '__main__':
    app.run(debug=True)
    