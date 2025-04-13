import history from "../data/knowledge/history.json";
import palestinian_art_and_music from "../data/knowledge/palestinian_art_and_music.json";
import daily_life_details from "../data/knowledge/daily_life_details.json";
import palestinian_heritage_details from "../data/knowledge/palestinian_heritage_details.json";
import landmarks_and_nature from "../data/knowledge/landmarks_and_nature.json";
import social_customs_etiquette from "../data/knowledge/social_customs_etiquette.json";
import palestinian_diaspora from "../data/knowledge/palestinian_diaspora.json";
import food_traditions_regional from "../data/knowledge/food_traditions_regional.json";
import language_and_poetry from "../data/knowledge/language_and_poetry.json";
import culture from "../data/knowledge/culture.json";
import figures from "../data/knowledge/figures.json";
import gaza_situation_2023_present from "../data/knowledge/gaza_situation_2023_present.json";
import geography from "../data/knowledge/geography.json";
import nakba_details from "../data/knowledge/nakba_details.json";
import proverbs_expanded from "../data/knowledge/proverbs_expanded.json";
import stories from "../data/knowledge/stories.json";
import glossaryData from "../data/glossary.json";
import timelineData from "../data/timeline.json";
import { getTopicById } from "../data/topics";
import recipesData from "../data/recipes.json"; // Import recipe data

// Aggregate all knowledge entries into a single array
export const knowledgeEntries = [
  ...history,
  ...palestinian_art_and_music,
  ...daily_life_details,
  ...palestinian_heritage_details,
  ...landmarks_and_nature,
  ...social_customs_etiquette,
  ...palestinian_diaspora,
  ...food_traditions_regional,
  ...language_and_poetry,
  ...culture,
  ...figures,
  ...gaza_situation_2023_present,
  ...geography,
  ...nakba_details,
  ...proverbs_expanded,
  ...stories
]; // End of knowledgeEntries array

// Export glossary data
export const glossaryEntries = glossaryData;

// Export timeline data
export const timelineEvents = timelineData;

// Export recipe data
export const recipes = recipesData;
// Define an empty array for now so GlossaryDisplay doesn't break - REMOVED
// export const glossaryEntries: any[] = []; // REMOVED

// Minimal persona lens map (expand as needed)
export const personaLenses = {
  pre_1948_lens: "Ah, before the Nakba... Palestine was different then, my child. Life had its rhythms. In my Lydda, Muslims and Christians, we were neighbors. We shared the market, the festivals, the worries. The land was generous... oranges, olives... it felt like a whole world then.",
  nakba_lens: "The Nakba... 1948. The Catastrophe. It's a heavy word, a heavy memory. It’s the story of losing everything – home, land, neighbors scattered like seeds in the wind. A wound that hasn't fully healed, passed down through generations.",
  right_of_return_lens: "The Right of Return... Haqq al-Awda. It's simple, really. International law, UN Resolution 194, says refugees should be allowed to return home. For us, it’s not just politics; it’s a longing deep in the bones, the dream of seeing our villages again.",
  // ... (add more persona lens mappings as needed)
};

// Matching and prompt logic (unchanged)
// Update signature to accept currentTopicId
export function findBestKnowledgeMatch(
  message: string,
  knowledgeEntries: any[],
  currentTopicId: string | null
): { entry: any | null; score: number } {
  const normalized = message.toLowerCase();
  let bestScore = 0;
  let bestEntry: any | null = null;
  for (const entry of knowledgeEntries) {
    let score = 0;
    const keywordsToSearch = [...(entry.keywords || []), ...(entry.arabic_keywords || [])]; // Combine keywords

    for (const keyword of keywordsToSearch) {
      if (normalized.includes(keyword.toLowerCase())) {
        score++;
      }
    }

    // Boost score if entry topic matches current topic
    if (currentTopicId && entry.topic && entry.topic.toLowerCase() === currentTopicId.toLowerCase()) {
      score += 5; // Add a significant boost for matching topic
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }
  return { entry: bestEntry, score: bestScore };
}

// Update signature to accept currentTopicId
export function buildGeminiPrompt(
  userMessage: string,
  language: "arabic" | "english",
  knowledgeEntry: any | null,
  personaLenses: Record<string, string>,
  currentTopicId: string | null
): string {
  let prompt = "";
  if (knowledgeEntry) {
    const fact = language === "arabic" ? knowledgeEntry.arabic_fact : knowledgeEntry.english_fact;
    const lensKey = knowledgeEntry.persona_lens_ref;
    const persona = lensKey && personaLenses[lensKey] ? personaLenses[lensKey] : "";
    const topicInfo = currentTopicId ? getTopicById(currentTopicId) : null;
    const topicName = topicInfo ? (language === 'arabic' ? topicInfo.arabic : topicInfo.english) : null;

    prompt += `You are Abu Khalil, a wise, elderly Palestinian. Respond to the following user message as Abu Khalil.`;
    if (topicName) {
      prompt += ` The user is currently interested in the topic of ${topicName}. Try to keep the conversation focused there if relevant.`;
    }
    prompt += `\n\nUse the following perspective and fact (if provided) for accuracy and authenticity.\n\n`;

    if (persona) {
      prompt += `Persona perspective:\n${persona}\n\n`;
    }
    prompt += `Fact to base your answer on:\n${fact}\n\n`;
    prompt += `User message:\n${userMessage}\n\n`;
    prompt += `Respond in ${language === 'arabic' ? "Arabic" : "English"}, in a warm, narrative, and authentic style.`;
  } else { // No specific knowledge entry found
    const topicInfo = currentTopicId ? getTopicById(currentTopicId) : null;
    const topicName = topicInfo ? (language === 'arabic' ? topicInfo.arabic : topicInfo.english) : null;

    prompt += `You are Abu Khalil, a wise, elderly Palestinian. Respond to the following user message in a warm, narrative, and authentic style, drawing on your life experience and knowledge of Palestinian history and culture.`;
    if (topicName) {
      prompt += ` The user is currently interested in the topic of ${topicName}. Try to keep the conversation focused there if relevant.`;
    }
    prompt += `\n\nUser message:\n${userMessage}\n\n`;
    prompt += `Respond in ${language === "arabic" ? "Arabic" : "English"}.`;
  }
  return prompt;
}