import { sendToFitMind } from "../api.js";

let chatHistory = [];

// Poziv tvog Render proxy servera
export async function sendMessageToGemini(message, history = []) {
  try {
    const response = await sendToFitMind(message);
    
    // Google API vrati format: response.candidates[0].content.parts[0].text
    const output =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "⚠️ Greška: Nema odgovora sa servera.";

    return output;

  } catch (err) {
    console.error("Greška u Gemini servisu:", err);
    throw err;
  }
}

// Kada se otvori nova sesija
export function startChatWithHistory(history = []) {
  chatHistory = history;
}
