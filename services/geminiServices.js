import { sendToFitMind } from "../api.js";

export async function startChatWithHistory(history) {
  // Ovo ostavljamo prazno jer Render proxy ne čuva istoriju
}

export async function sendMessageToGemini(text, history) {
  const response = await sendToFitMind(text);

  try {
    return response.candidates?.[0]?.content?.parts?.[0]?.text || 
           response.text || 
           "⚠️ Greška pri obradi odgovora.";
  } catch (err) {
    console.error("AI parsing error:", err);
    return "⚠️ Greška. Pokušajte ponovo.";
  }
}
