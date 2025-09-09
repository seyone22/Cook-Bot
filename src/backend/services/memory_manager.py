# src/backend/services/memory_manager.py
import hashlib
import tiktoken
from datetime import datetime
from typing import List, Dict, Any
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

class MemoryManager:
    def __init__(self, openai_client, vector_index,
                 embedding_model: str = "text-embedding-3-small",
                 chat_model: str = "gpt-4.1-mini"):
        self.openai = openai_client
        self.index = vector_index
        self.embedding_model = embedding_model
        self.chat_model = chat_model
        self.sessions: Dict[str, List[Dict[str, str]]] = {}  # in-memory sliding windows

        # Config
        self.max_sliding_tokens = 150
        self.summary_trigger_tokens = 400  # threshold for summarization
        self.encoder = tiktoken.encoding_for_model(chat_model)

    # ------------------------
    # Sliding window handling
    # ------------------------
    def add_message(self, session_id: str, role: str, content: str):
        if session_id not in self.sessions:
            self.sessions[session_id] = []

        self.sessions[session_id].append({"role": role, "content": content, "time": datetime.utcnow()})
        self._trim_sliding_window(session_id)

    def _count_tokens(self, text: str) -> int:
        return len(self.encoder.encode(text))

    def _trim_sliding_window(self, session_id: str):
        """Trim conversation history to fit token budget."""
        history = self.sessions[session_id]
        total_tokens = sum(self._count_tokens(m["content"]) for m in history)

        while total_tokens > self.max_sliding_tokens and len(history) > 1:
            removed = history.pop(0)
            total_tokens -= self._count_tokens(removed["content"])

    def get_recent_context(self, session_id: str) -> List[Dict[str, str]]:
        return self.sessions.get(session_id, [])

    # ------------------------
    # Embedding + Pinecone
    # ------------------------
    def embed_and_store(self, session_id: str, content: str, role: str):
        """Embed and persist message into Pinecone, with console logging."""
        # ------------------------
        # Get embedding from OpenAI
        # ------------------------
        embedding_response = self.openai.embeddings.create(
            model=self.embedding_model,
            input=content
        )
        embedding = embedding_response.data[0].embedding

        # ------------------------
        # Create unique ID
        # ------------------------
        uid = hashlib.sha256(f"{session_id}-{content}".encode()).hexdigest()

        # ------------------------
        # Upsert into Pinecone
        # ------------------------
        result = self.index.upsert(vectors=[{
            "id": uid,
            "values": embedding,
            "metadata": {
                "session_id": session_id,
                "role": role,
                "content": content,
                "timestamp": datetime.utcnow().isoformat()
            }
        }])

        # ------------------------
        # Logging
        # ------------------------
        upserted_count = result.get("upserted_count", "unknown")
        logging.info(f"[Pinecone Upsert] Session: {session_id}, Role: {role}, "
                     f"Content preview: {content[:50]!r}, Upserted vectors: {upserted_count}")

    def retrieve_context(self, query: str, session_id: str, top_k: int = 5) -> List[str]:
        """Retrieve semantically similar past messages."""
        embedding = self.openai.embeddings.create(
            model=self.embedding_model,
            input=query
        ).data[0].embedding

        results = self.index.query(vector=embedding, top_k=top_k, include_metadata=True, filter={"session_id": session_id})
        return [m["metadata"]["content"] for m in results["matches"]]

    # ------------------------
    # Summarization
    # ------------------------
    def needs_summary(self, session_id: str) -> bool:
        """Check if conversation exceeds summary trigger threshold."""
        history = self.sessions.get(session_id, [])
        total_tokens = sum(self._count_tokens(m["content"]) for m in history)
        return total_tokens > self.summary_trigger_tokens

    def summarize_and_store(self, session_id: str):
        """Summarize old conversation and push to Pinecone as memory note."""
        history = self.sessions.get(session_id, [])
        if not history:
            return None

        # Convert to a conversation string
        convo_text = "\n".join([f"{m['role']}: {m['content']}" for m in history])

        summary_prompt = [
            {"role": "system", "content": "Summarize the following conversation and extract key facts the assistant should remember for future context."},
            {"role": "user", "content": convo_text}
        ]

        response = self.openai.chat.completions.create(
            model=self.chat_model,
            messages=summary_prompt,
            max_tokens=300
        )

        summary_text = response.choices[0].message.content.strip()

        # Store summary as a special "memory note"
        self.embed_and_store(session_id, summary_text, role="summary")

        # Clear sliding window (reset, keep only last message maybe)
        self.sessions[session_id] = history[-2:]

        return summary_text
