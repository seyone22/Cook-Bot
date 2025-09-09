"use client";

import {Box, Button, TextField} from "@mui/material";
import styles from "../page.module.css";
import {MessageBubble} from "@/app/components/MessageBubble";

export interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatContainer({
                           messages,
                           input,
                           setInput,
                           sendMessage,
                       }: {
    messages: Message[];
    input: string;
    setInput: (val: string) => void;
    sendMessage: () => void;
}) {
    return (
        <Box className={styles.chatContainer}>
            <Box className={styles.messages}>
                {messages.map((m, i) => (
                    <MessageBubble key={i} message={m}/>
                ))}
            </Box>
            <Box className={styles.inputArea}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                    }}
                />
                <Button variant="contained" onClick={sendMessage}>
                    Send
                </Button>
            </Box>
        </Box>
    );
}