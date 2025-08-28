export async function sendMessage(prompt: string): Promise<string> {
    const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Proxy failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    if (typeof data?.response !== "string") {
        throw new Error("Invalid response from API");
    }
    return data.response;
}
