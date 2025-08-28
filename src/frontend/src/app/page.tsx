"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    // Add user message locally
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Call backend API
    const res = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3-4b", // match what you’re running in backend
        prompt: userMessage.content,
      }),
    });

    const data = await res.json();

    const assistantMessage = {
      role: "assistant",
      content: data.response || "[No response]",
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setInput("");
  }

  return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {messages.map((m, i) => (
              <div
                  key={i}
                  style={{
                    margin: "0.5rem 0",
                    textAlign: m.role === "user" ? "right" : "left",
                  }}
              >
            <span
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px",
                  background: m.role === "user" ? "#0070f3" : "#e5e5ea",
                  color: m.role === "user" ? "#fff" : "#000",
                  maxWidth: "70%",
                  wordWrap: "break-word",
                }}
            >
              {m.content}
            </span>
              </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ display: "flex", padding: "1rem", borderTop: "1px solid #ddd" }}>
          <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
          />
          <button
              onClick={sendMessage}
              style={{
                marginLeft: "0.5rem",
                padding: "0.75rem 1rem",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
          >
            Send
          </button>
        </div>
      </div>
  );
}
