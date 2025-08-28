"use client";

import {useState} from "react";
import {sendMessage} from "../lib/api";
import ChatBox from "../components/ChatBox";
import MessageBubble from "../components/MessageBubble";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
    const [messages, setMessages] = useState<Msg[]>([
        {role: "assistant", content: "Hi! Ask me anything."},
    ]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSend(userText: string) {
        setError(null);
        const next = [...messages, {role: "user", content: userText} as Msg];
        setMessages(next);

        try {
            setBusy(true);
            const reply = await sendMessage(userText);
            setMessages((prev) => [...prev, {role: "assistant", content: reply}]);
        } catch (e: any) {
            setError(e?.message ?? "Request failed");
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Sorry, I hit an error reaching the backend. Please try again.",
                },
            ]);
        } finally {
            setBusy(false);
        }
    }

    return (
        <main
            style={{
                height: "100vh",
                display: "grid",
                gridTemplateRows: "1fr auto",
                background: "white",
            }}
        >
            <div style={{padding: 16, overflowY: "auto"}}>
                {messages.map((m, i) => (
                    <MessageBubble key={i} role={m.role} content={m.content}/>
                ))}
                {busy && (
                    <div style={{color: "#6b7280", fontSize: 13, padding: "4px 12px"}}>
                        Assistant is thinking…
                    </div>
                )}
                {error && (
                    <div
                        style={{
                            color: "#b91c1c",
                            background: "#fee2e2",
                            border: "1px solid #fecaca",
                            padding: "8px 12px",
                            borderRadius: 8,
                            marginTop: 8,
                            fontSize: 13,
                        }}
                    >
                        {error}
                    </div>
                )}
            </div>

            <div style={{borderTop: "1px solid #e5e7eb"}}>
                <ChatBox onSend={handleSend} disabled={busy}/>
            </div>
        </main>
    );
}
