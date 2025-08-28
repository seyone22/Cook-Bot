# Software Requirements Specification (SRS) – Cook Bot (Simplified Chatbot)

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for a **local AI-powered chatbot** that runs on a CPU, using a Qwen 4B model with llama-cpp-python. The chatbot maintains a **sliding-window conversation memory** and provides **context-aware responses** through a FastAPI backend and a Next.js frontend.

### 1.2 Scope
The chatbot allows users to:
- Chat naturally with an AI assistant.
- Maintain **recent conversation context** efficiently to avoid token overflow.
- Run entirely locally on a laptop without GPU dependency.

The solution will be delivered as:
- A **web-based chat interface** using Next.js.
- A **FastAPI backend** managing LLM calls and memory state.
- A **memory management layer** using sliding-window history.

### 1.3 Intended Audience
- Developers and evaluators reviewing technical design, architecture, and implementation quality.

---

## 2. System Overview

### 2.1 High-Level Architecture
- **Frontend (Next.js/React)**:  
  - Chat interface for user messages and AI responses.  
  - Simple, minimalistic UI.  

- **Backend (Python/FastAPI)**:  
  - Chat API: receives messages, passes context to Qwen 4B, returns responses.  
  - Memory manager: maintains sliding-window conversation history.

- **Memory Layer**:  
  - Sliding window of recent conversation turns (configurable size).  
  - Prevents token overflow by sending only the last N messages to the model.

- **AI Integration**:  
  - Qwen 4B model (local `.gguf` file) using **llama-cpp-python**.

---

## 3. Functional Requirements

### 3.1 Core Features
- **Chat Interface**
  - User can send text messages.
  - Bot replies with **context-aware responses**.

- **Memory Management**
  - Maintain a **sliding window** of recent conversation turns.
  - Older messages outside the window are discarded.
  - History is formatted as a prompt string for the model.

- **LLM Integration**
  - Local inference using **Qwen 4B** with llama-cpp-python.
  - CPU-only execution (no GPU dependency).
  - Configurable context size to match model capacity.

### 3.2 APIs
- **POST `/chat/`**
  - Request: 
    ```json
    { "prompt": "<user message>" }
    ```
  - Response: 
    ```json
    { "response": "<AI reply>" }
    ```

- **POST `/chat/stream`** (optional)
  - Request: 
    ```json
    { "prompt": "<user message>" }
    ```
  - Response: Streaming text response in chunks.

---

## 4. Non-Functional Requirements

- **Performance**
  - Response within **2–3 seconds** on CPU.
  - Efficient prompt construction to avoid exceeding token limit.

- **Scalability**
  - Modular backend structure, allowing future addition of multi-user support or embeddings.

- **Usability**
  - Minimal chat UI.
  - Smooth text display, optionally streaming responses.

- **Maintainability**
  - Clear separation of frontend, backend, and memory layers.
  - Well-documented code with reusable modules.

- **Portability**
  - Runs locally with CPU.
  - Can be deployed via Docker or standard Python environment.
  - Frontend runs on Next.js dev server or production build.

---

## 5. Use Cases

### UC1: Basic Chat
**Actor**: User  
**Precondition**: Chatbot is running.  
**Steps**:
1. User sends a message: “Hello, how are you?”  
2. Backend appends message to sliding window memory.  
3. Backend sends prompt to Qwen 4B model.  
4. Bot responds with context-aware reply.  
5. Backend appends AI response to memory.  

---

## 6. Assumptions and Limitations
- **Single-user** system; no authentication.
- Chat context is **limited to sliding-window size**.
- Runs locally; GPU is optional but not required.
- No persistent storage of conversation; memory resets on server restart.
- Only text-based interaction; no voice or multimedia.
