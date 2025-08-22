# Software Requirements Specification (SRS) – Cook Bot

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for a prototype AI-powered chatbot that maintains a persistent inventory of a user’s fridge and provides conversational assistance for meal suggestions. The chatbot demonstrates **frontend + AI model integration**, **conversation memory management**, and **application state management**.

### 1.2 Scope
The chatbot allows users to:
- Chat naturally with an AI assistant.
- Query and update the state of their fridge inventory.
- Receive meal suggestions based on current fridge contents.
- Maintain the conversation context efficiently without resending the full chat history each time.

The solution will be delivered as:
- A simple **web-based chat interface**.
- A **backend service** managing both LLM calls and inventory state.
- A **memory management layer** handling conversation summarization and efficient context building.

### 1.3 Intended Audience
- Hiring evaluators reviewing technical design and implementation quality.


## 2. System Overview

### 2.1 High-Level Architecture
- **Frontend (React/Next.js)**: Chat UI, optional fridge state panel (based on time constraints).
- **Backend (Node.js/Express or Python/FastAPI)**:
    - Chat API: manages messages, builds LLM context.
    - Fridge API: CRUD operations on inventory state.
- **Memory Layer**:
    - Sliding window for recent turns.
    - Summarization for older history.
    - Persistent state for fridge contents.
- **AI Integration**: OpenAI GPT (or equivalent LLM) with system prompt configured as a “kitchen assistant.”


## 3. Functional Requirements

### 3.1 Core Features
- **Chat Interface**
    - User can send text messages.
    - Bot replies with context-aware responses.

- **Fridge State Management**
    - User can query fridge contents.
    - User can add/remove/update items by chatting (e.g., “I ate 2 eggs”).
    - Backend ensures inventory persistence during the session.

- **Meal Suggestions**
    - Bot suggests meals based on fridge state and conversation context.

- **Memory Management**
    - Maintain a sliding window of recent turns.
    - Summarize older messages into a digest for continuity.
    - Avoid sending entire history on each request.

### 3.2 APIs
TODO


## 4. Non-Functional Requirements

- **Performance**:
    - Responses within 2–3 seconds (excluding LLM latency).
    - Efficient context building (token limit not exceeded).

- **Scalability**:
    - Architecture supports plugging in a persistent DB (Redis) for fridge state.
    - Memory system can be extended with embeddings (vector DB) (If time allows).

- **Usability**:
    - Clean, minimal chat UI.
    - Clear feedback when fridge state updates.

- **Maintainability**:
    - Modular backend structure (separate controllers for chat + fridge).
    - Well-documented code.

- **Portability**:
    - Should run locally via Docker or Node + NPM setup.
    - Deploy on Vercel / CloudFlare

## 5. Use Cases

### UC1: Query Fridge Contents
**Actor**: User  
**Precondition**: Fridge state exists.  
**Steps**:
1. User asks: “What’s in my fridge?”
2. Backend retrieves state.
3. Bot responds with item list.

### UC2: Update Fridge Contents
**Actor**: User  
**Precondition**: Fridge has items.  
**Steps**:
1. User says: “I ate 2 eggs.”
2. Backend parses intent → updates inventory.
3. Bot confirms: “Got it, you now have 2 eggs left.”

### UC3: Suggest Dinner
**Actor**: User  
**Steps**:
1. User asks: “What can I cook tonight?”
2. Backend passes fridge state + recent history to LLM.
3. Bot suggests meal idea.

## 6. Assumptions and Limitations
- Fridge inventory is a simplified structure (item + quantity).
- No authentication/multi-user support (demo scope).
- Natural language inventory updates will use simple parsing (not full NLP pipeline).
- Chatbot uses external LLM API (not local inference).