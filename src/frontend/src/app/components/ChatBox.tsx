"use client";

import { useState } from "react";

type Props = {
    onSend: (message: string) => Promise<void>;
    disabled?: boolean;
};

export default function ChatBox({ onSend, disabled }: Props) {
    const [value, setValue] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleSend() {
        const msg = value.trim();
        if (!msg || busy || disabled) return;
        setBusy(true);
        try {
            await onSend(msg);
            setValue("");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div style={{ display: "flex", gap: 8, padding: 8 }}>
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Type your message..."
                disabled={busy || disabled}
                style={{
                    flex: 1,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 14,
                }}
            />
            <button
                onClick={handleSend}
                disabled={busy || disabled}
                style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "#111827",
                    color: "white",
                    cursor: busy || disabled ? "not-allowed" : "pointer",
                }}
            >
                {busy ? "Sending…" : "Send"}
            </button>
        </div>
    );
}
