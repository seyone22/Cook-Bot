# Cook Bot – AI Chatbot

Cook Bot is a simple AI chatbot powered by a local **Qwen3 4B model** via `llama-cpp-python`.  
The project has a **FastAPI backend** for AI inference and a **Next.js frontend** for chatting.

---

## Features

- Chat with a Qwen3-4B LLM running locally.
- Maintains a **sliding window memory** of recent messages to avoid token overload.
- Frontend built in **Next.js**.
- Backend runs **FastAPI** with `llama-cpp-python`.

---

## Project Structure

```

src/
├─ backend/        # FastAPI server
│  ├─ Dockerfile (backend)
│  ├─ main.py
│  ├─ services/
│  │  ├─ ai\_service.py
│  │  └─ memory\_manager.py
│  └─ routes/
│     └─ chat.py
└─ frontend/       # Next.js app
│  ├─ Dockerfile (frontend)
├─ app/
├─ package.json
└─ ...
docker-compose.yml

````

---

## Prerequisites

- Docker & Docker Compose installed
- Qwen3-4B `.gguf` model placed at `src/backend/models/qwen/Qwen3-4B-Q5_K_M.gguf`
- Node.js (for local dev if not using Docker)

---

## Setup & Run (Docker)

1. Clone the repo:

```bash
git clone <repo-url>
cd Cook-Bot
````

2. Build and start containers:

```bash
docker-compose up --build
```

3. Access the app:

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:8000/chat](http://localhost:8000/chat)

---

## Backend Notes

* **FastAPI server** is in `src/backend`.
* **Model** is loaded locally from `models/qwen/Qwen3-4B-Q5_K_M.gguf`.
* Ensure the model file exists. If it does not, get the right one from https://huggingface.co/unsloth/Qwen3-4B-GGUF/blob/main/Qwen3-4B-Q5_K_M.gguf
* **MemoryManager** handles sliding window context for chat history.
* **Chat API endpoints:**

  * `POST /chat/` – returns the chatbot response.
  * `POST /chat/stream` – returns streaming response (optional).

---

## Frontend Notes

* **Next.js app** is in `src/frontend`.
* **API URL** is configured via `NEXT_PUBLIC_API_URL=http://backend:8000` inside Docker.
* The frontend automatically loads the chat page by default.

---

## Development (without Docker)

1. Backend:

```bash
cd src/backend
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

2. Frontend:

```bash
cd src/frontend
npm install
npm run dev
```

---

## License

MIT License

```

This README clearly explains **project structure, setup, Docker usage, and endpoints**.  

Do you want me to also add **testing instructions for the backend endpoints** using the `.http` test file?
```
