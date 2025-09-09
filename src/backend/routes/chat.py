from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ClearMemoryRequest(BaseModel):
    session_id: str

@router.post("/")
async def chat_endpoint(req: Request, body: ChatRequest):
    memory = req.app.state.memory

    # ------------------------
    # Store user message
    # ------------------------
    memory.add_message(body.session_id, "user", body.message)
    memory.embed_and_store(body.session_id, body.message, role="user")

    # ------------------------
    # Summarization Check
    # ------------------------
    if memory.needs_summary(body.session_id):
        summary = memory.summarize_and_store(body.session_id)
        if summary:
            print(f"[Summary created for {body.session_id}] {summary}")

    # ------------------------
    # Get context
    # ------------------------
    sliding_window = memory.get_recent_context(body.session_id)
    retrieved = memory.retrieve_context(body.message, session_id=body.session_id)

    # ------------------------
    # Build prompt
    # ------------------------
    messages = [{"role": "system", "content": "You are a helpful chatbot."}]
    messages.extend(
        [{"role": m["role"], "content": m["content"]} for m in sliding_window]
    )
    if retrieved:
        messages.append({
            "role": "system",
            "content": "Relevant context:\n" + "\n".join(retrieved)
        })
    messages.append({"role": "user", "content": body.message})

    # ------------------------
    # Call OpenAI
    # ------------------------
    completion = req.app.state.openai.chat.completions.create(
        model=memory.chat_model,
        messages=messages
    )
    reply = completion.choices[0].message

    # ------------------------
    # Store assistant reply
    # ------------------------
    memory.add_message(body.session_id, reply.role, reply.content)
    memory.embed_and_store(body.session_id, reply.content, role=reply.role)

    return {"reply": reply.content}


@router.post("/clear")
async def clear_memory(req: Request, body: ClearMemoryRequest):
    memory = req.app.state.memory

    if body.session_id not in memory.sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    # Clear in-memory sliding window
    memory.sessions.pop(body.session_id)

    # Optional: delete Pinecone vectors for this session
    # If you want to fully erase session memory
    # You can use a metadata filter for session_id
    memory.index.delete(delete_all=False, filter={"session_id": body.session_id})

    return {"status": "success", "message": f"Memory for session {body.session_id} cleared."}