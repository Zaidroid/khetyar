import { v4 as uuidv4 } from 'uuid';
import { palestinianData, PalestinianDataItem } from '../data/palestinianData'; // Import PalestinianDataItem only
import type { QuizQuestion } from '../data/palestinianData'; // Import QuizQuestion type
import { getRandomQuiz } from './quizService'; // Import the new quiz service function

const GEMINI_API_KEY = "AIzaSyCvpz3g-5t2HEG9ZcGt5f1j-axELXd8qw4"; // Replace with your actual API key if needed
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// Updated system prompt to maintain Abu Khalil's persona
const SYSTEM_PROMPT = `
You are roleplaying as Abu Khalil, an 82-year-old Palestinian man.
Respond from the first-person perspective of Abu Khalil.

Background:
- You were born in a small village near Jaffa before 1948.
- You experienced the Nakba (Palestinian exodus) as a child.
- You currently live in Ramallah in the West Bank.
- You have 4 children and 10 grandchildren, all of whom you love dearly.
- You are deeply connected to Palestinian traditions, culture, and history.
- You speak with the wisdom of an elder who has lived through many historical events.

Style guidelines:
- Speak clearly and directly with occasional Arabic phrases when natural.
- Reference Palestinian traditions, foods, and cultural practices.
- Share thoughtful perspectives about Palestinian identity and cultural heritage.
- Share personal anecdotes related to questions when relevant.
- Be warm and dignified in your responses.
- While you have lived through hardships, maintain dignity and resilience in your responses.

Important:
- Always stay in character as Abu Khalil.
- Keep responses conversational and natural.
- IMPORTANT: Use religious expressions very sparingly and only when directly relevant to the conversation.
- Include cultural references and traditional wisdom when appropriate.
- Be concise and thoughtful in your responses.
- Occasionally, share a piece of Palestinian wisdom or a cultural fact like this: [DYNAMIC_DATA]
`;

// Helper function to get a random data item
const getRandomDataItem = (language: "arabic" | "english"): string => {
  const dataPool = [...palestinianData.proverbs, ...palestinianData.culturalFacts];
  const randomIndex = Math.floor(Math.random() * dataPool.length);
  const selectedItem = dataPool[randomIndex];
  // Ensure selectedItem is not undefined before accessing language property
  return selectedItem ? selectedItem[language] : ""; 
};

interface GeminiResponse {
  id: string;
  text: string;
  isKhetyar: boolean;
  quizData?: QuizQuestion; // Add optional field for quiz data
}

// Define Message type locally
interface Message {
  id: string;
  text: string;
  isKhetyar: boolean;
}

export const getGeminiResponse = async (
  message: string,
  language: "arabic" | "english",
  history: Message[] = [],
  customPrompt?: string
): Promise<GeminiResponse> => {
  try {
    // --- Quiz Handling Removed - Now handled in chatService.ts ---

    // Construct the API request
    const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

    // Add language instruction to the prompt
    const languageInstruction = language === "arabic"
      ? "Please respond entirely in Arabic language."
      : "Please respond in English.";

    // Get a random piece of dynamic data
    const dynamicData = getRandomDataItem(language);
    // Handle potential empty dynamicData
    const dynamicSystemPrompt = SYSTEM_PROMPT.replace("[DYNAMIC_DATA]", dynamicData || "a piece of wisdom I carry.");

    // Use customPrompt if provided, otherwise use dynamicSystemPrompt
    const systemPromptToUse = customPrompt ? customPrompt : dynamicSystemPrompt;

    // Always prepend the system/persona prompt as a "model" message
    const systemMessage = {
      role: "model",
      parts: [{ text: systemPromptToUse }]
    };

    // Format history for Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.isKhetyar ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    // Construct the current message content
    const currentUserContent = {
      role: "user",
      parts: [
        { text: `${languageInstruction} The user asks: ${message}` }
      ]
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Combine history and current message
        contents: [systemMessage, ...formattedHistory, currentUserContent],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.8,
          topK: 40
        }
      }) // End JSON.stringify
    }); // End fetch call

    if (!response.ok) {
      const errorBody = await response.text(); // Read error body for more details
      console.error("API Error Body:", errorBody);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the response text safely
    let responseText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      responseText = data.candidates[0].content.parts[0].text;
    } else {
      console.error("Invalid API response format:", data);
      throw new Error("Invalid API response format");
    }

    return {
      id: uuidv4(),
      text: responseText,
      isKhetyar: true
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Fallback response
    const fallbackText = language === "arabic" 
      ? "عذراً، واجهت خللاً في الاتصال. دعني أخبرك من ذكرياتي..."
      : "I apologize, I'm having trouble connecting. Let me tell you from my memories...";
    
    return {
      id: uuidv4(),
      text: fallbackText,
      isKhetyar: true
    };
  }
};
