import type { QuizQuestion } from "../data/palestinianData";

// --- Static Imports for Quiz Data ---
// IMPORTANT: Create these files in src/data/quizzes/ and populate them!
// Add imports for all your quiz JSON files here.
import historyQuizzes from "../data/quizzes/history.json";
// import cultureQuizzes from "../data/quizzes/culture.json"; // Uncomment when file exists
// import geographyQuizzes from "../data/quizzes/geography.json"; // Uncomment when file exists
// import foodQuizzes from "../data/quizzes/food.json"; // Uncomment when file exists
// Example: import artQuizzes from "../data/quizzes/art.json";
// ... add more imports as you create more quiz files

// --- Aggregated Quiz Data ---

// Combine all imported quiz arrays into one
export const allQuizzes: QuizQuestion[] = [
  ...(historyQuizzes as QuizQuestion[]),
  // ...(cultureQuizzes as QuizQuestion[]), // Uncomment when file exists
  // ...(geographyQuizzes as QuizQuestion[]), // Uncomment when file exists
  // ...(foodQuizzes as QuizQuestion[]), // Uncomment when file exists
  // ... spread operator for other imported quiz arrays
];

// --- Utility Functions (Optional) ---

/**
 * Gets a random quiz question from the entire pool.
 * Returns null if no quizzes are loaded.
 */
export function getRandomQuiz(): QuizQuestion | null {
  if (allQuizzes.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * allQuizzes.length);
  return allQuizzes[randomIndex];
}

/**
 * Gets a random quiz question filtered by topic ID.
 * Returns null if no quizzes match the topic or none are loaded.
 */
export function getQuizByTopic(topicId: string): QuizQuestion | null {
  const filtered = allQuizzes.filter(quiz => quiz.topicId === topicId);
  if (filtered.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

// Add more functions as needed