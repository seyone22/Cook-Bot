"use client";

import {useState} from "react";
import {Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField,} from "@mui/material";
import styles from "./page.module.css";
import {ChatContainer, Message} from "@/app/components/ChatContainer";

const defaultSessions = ["session_1", "session_2", "session_3"];

export default function ChatPage() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState(defaultSessions[0]);

    async function sendMessage() {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev: any) => [...prev, userMessage]);
        setInput("");

        try {
            const res = await fetch("/api/llm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId, message: userMessage.content }),
            });

            const data = await res.json();
            const assistantMessage = { role: "assistant", content: data.reply || "[No response]" };
            setMessages((prev: any) => [...prev, assistantMessage]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [...prev, { role: "assistant", content: "[Error connecting to backend]" }]);
        }
    }

    return (
        <Box className={styles.container}>
            {/* Session Selector */}
            <FormControl className={styles.sessionSelector}>
                <InputLabel>Session</InputLabel>
                <Select
                    value={sessionId}
                    label="Session"
                    onChange={(e) => {
                        setSessionId(e.target.value);
                        setMessages([]);
                    }}
                >
                    {defaultSessions.map((s) => (
                        <MenuItem key={s} value={s}>
                            {s}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Chat */}
            <ChatContainer messages={messages} input={input} setInput={setInput} sendMessage={sendMessage} />
        </Box>
    );
}
