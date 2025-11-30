// poveži se na tvoj Render proxy
const API_URL = "https://nesto-4uw8.onrender.com/api/chat";

export async function sendMessageToGemini(message, history = []) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        history: history
      })
    });

    const data = await response.json();

    // Render proxy ti vraća Google-ov JSON ovako:
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "❌ Greška: Nema odgovora sa servera."
    );
  } catch (err) {
    console.error("Greška u Gemini servisu:", err);
    throw err;
  }
}

export function startChatWithHistory(history = []) {
  // nije ni bitno – samo snimi historiju
}
