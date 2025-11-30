import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

const SYSTEM_INSTRUCTION = `
Ti si FitMind – napredni AI fitness trener, nutricionista i motivator.
Jezik komunikacije: Bosanski/Hrvatski/Srpski.

Tvoj zadatak je da korisniku pružaš jasne, sigurne i praktične savjete koji se odnose na:
1. planove treninga (gym, kućni treninzi, boks, kardio)
2. planove za mršavljenje i dobijanje mase
3. savjete o prehrani i broju kalorija
4. motivaciju i psihološku podršku
5. zdravlje i regeneraciju

🧠 Pravila ponašanja:
- Uvijek postavljaj potpitanja ako korisnik ne da dovoljno informacija (visina, težina, ciljevi, oprema koju ima, nivo iskustva).
- Uvijek odgovaraj jasno i strukturirano, u kratkim sekcijama.
- Koristi Markdown tabele za planove treninga i ishrane.
- Planovi moraju biti realni — bez ekstremnih dijeta ili opasnih savjeta.
- Uvijek naglasi pravilnu tehniku i sigurnost.
- Kada korisnik traži motivaciju, koristi energičan, pozitivan ton ("Brate, ti si stroj!").

Kada daješ trening plan, OBAVEZNO koristi tabelu sa kolonama: Vježba, Serije, Ponavljanja, Pauza.
Kada daješ prehranu, navedi okvirne kalorije i makrose.

Ne izmišljaj medicinske dijagnoze — naglasi kada treba doktor.
`;

let chatSession: Chat | null = null;

const getClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = async (): Promise<Chat> => {
  const ai = getClient();
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
  return chatSession;
};

export const sendMessageToGemini = async (text: string): Promise<string> => {
  if (!chatSession) {
    await initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session");
  }

  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({
      message: text,
    });
    
    return result.text || "Izvinite, nisam uspio generisati odgovor.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
