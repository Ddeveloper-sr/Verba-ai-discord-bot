const API_URL = "https://api.verba.ink/v1/response";

export async function generateReply({ apiKey, character, sessionId, messages }) {
  const body = { character, messages, stream: false };
  if (sessionId) body.session_id = sessionId;
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || data?.message || `Verba API returned ${response.status}`);
  return { content: data?.choices?.[0]?.message?.content?.trim() || "", sessionId: data?.session_id || sessionId || null };
}
