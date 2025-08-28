# src/backend/services/memory_manager.py

class MemoryManager:
    def __init__(self):
        self.history = []

    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})

    def get_context(self) -> str:
        """Return history formatted as a string context prompt."""
        return "\n".join([f"{m['role']}: {m['content']}" for m in self.history])

    def clear(self):
        self.history = []
