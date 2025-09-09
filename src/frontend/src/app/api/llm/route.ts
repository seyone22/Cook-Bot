import { NextRequest, NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "../../lib/config";

interface ChatBody {
    session_id: string;
    message: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: ChatBody = await req.json();

        // Validate payload
        if (!body?.session_id || !body?.message || body.message.trim().length === 0) {
            return NextResponse.json({ error: "Invalid session_id or message" }, { status: 400 });
        }

        // Forward to FastAPI
        const res = await fetch(`${BACKEND_BASE_URL}/chat/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            return NextResponse.json({ error: `Backend error (${res.status}): ${text}` }, { status: 502 });
        }

        const data = await res.json();

        // Expecting { reply: string }
        if (typeof data?.reply !== "string") {
            return NextResponse.json({ error: "Malformed backend response" }, { status: 502 });
        }

        return NextResponse.json({ reply: data.reply });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? "Proxy error" }, { status: 500 });
    }
}
