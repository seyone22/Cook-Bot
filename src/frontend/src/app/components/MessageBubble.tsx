
// ------------------------
// MessageBubble Component

import { Box } from "@mui/material";
import styles from "../page.module.css";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";
    return (
        <Box className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}>
            <Box className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
                {message.content}
            </Box>
        </Box>
    );
}