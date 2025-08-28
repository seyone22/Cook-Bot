"use client";

type Props = {
    role: "user" | "assistant";
    content: string;
};

export default function MessageBubble({ role, content }: Props) {
    const isUser = role === "user";
    return (
        <div
            style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                marginBottom: "8px",
            }}
        >
            <div
                style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    whiteSpace: "pre-wrap",
                    background: isUser ? "#2563eb" : "#f3f4f6",
                    color: isUser ? "white" : "#111827",
                    border: isUser ? "none" : "1px solid #e5e7eb",
                    fontSize: 14,
                    lineHeight: 1.4,
                }}
            >
                {content}
            </div>
        </div>
    );
}
