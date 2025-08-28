from llama_cpp import Llama

# ------------------------
# Model helper functions
# ------------------------

def generate_response(prompt: str, llm: Llama) -> str:
    """Generate a non-streaming response."""
    output = llm(
        prompt,
        max_tokens=256,
        stop=["Q:", "\n"]
    )
    return output["choices"][0]["text"].strip()


def stream_response(prompt: str, llm: Llama):
    """Generator that yields streaming responses chunk by chunk."""
    for chunk in llm(prompt, max_tokens=256, stream=True):
        yield chunk["choices"][0]["text"]
