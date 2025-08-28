import { NextRequest, NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "../../lib/config";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate payload quickly
        if (!body || typeof body.prompt !== "string" || body.prompt.trim().length === 0) {
            return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
        }

        // Forward to FastAPI
        const res = await fetch(`${BACKEND_BASE_URL}/chat/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            // If you deploy both behind the same network, keep default mode
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            return NextResponse.json(
                { error: `Backend error (${res.status}): ${text}` },
                { status: 502 }
            );
        }

        const data = await res.json();
        // Expecting { response: string }
        if (typeof data?.response !== "string") {
            return NextResponse.json(
                { error: "Malformed backend response" },
                { status: 502 }
            );
        }

        return NextResponse.json({ response: data.response });
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? "Proxy error" },
            { status: 500 }
        );
    }
}
