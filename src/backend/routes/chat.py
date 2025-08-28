from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from llama_cpp import Llama

from services.ai_service import generate_response, stream_response

router = APIRouter(prefix="/chat", tags=["chat"])

# ------------------------
# Request/Response Models
# ------------------------
class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str

# ------------------------
# Dependency
# ------------------------
def get_llm() -> Llama:
    from main import app   # import here to avoid circular import
    return app.state.llm

def get_memory():
    from main import app
    return app.state.memory

# ------------------------
# Endpoints
# ------------------------
@router.post("", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, llm: Llama = Depends(get_llm), memory = Depends(get_memory)):
    # Add user message
    memory.add_message("User", request.prompt)

    # Build prompt with context
    context = memory.get_context()
    response_text = generate_response(context, llm)

    # Add assistant response
    memory.add_message("Assistant", response_text)

    return ChatResponse(response=response_text)


@router.post("/stream")
def stream_endpoint(request: ChatRequest, llm: Llama = Depends(get_llm), memory = Depends(get_memory)):
    # Add user message
    memory.add_message("User", request.prompt)

    # Build context
    context = memory.get_context()

    def generator():
        for chunk in stream_response(context, llm):
            yield chunk
    return StreamingResponse(generator(), media_type="text/plain")
