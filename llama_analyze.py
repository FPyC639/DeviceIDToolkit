import sys
import json
from llama_cpp import Llama

def analyze_data(prompt):
    try:
        # Initialize the model (adjust path as needed)
        llm = Llama(
            model_path="./models/mistral-7b-instruct-v0.1.Q5_0.gguf",
            n_ctx=32768,  # Context window
            n_threads=4,  # CPU threads
            verbose=False
        )
        
        # Generate response
        response = llm(
            prompt,
            max_tokens=256,
            temperature=0.7,
            top_p=0.9,
            stop=["</s>", "\n\n"]
        )
        
        return response['choices'][0]['text'].strip()
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        prompt = sys.argv[1]
        result = analyze_data(prompt)
        print(result)
    else:
        print("Error: No prompt provided")