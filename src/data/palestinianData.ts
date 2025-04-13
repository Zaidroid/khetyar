export interface PalestinianDataItem {
  arabic: string;
  english: string;
}

export interface QuizQuestion {
  question: PalestinianDataItem;
  options: PalestinianDataItem[]; // Array of options
  correctAnswerIndex: number;
  explanation?: PalestinianDataItem;
  topicId?: string; // Optional: To categorize quizzes
}

export interface PalestinianData {
  proverbs: PalestinianDataItem[];
  culturalFacts: PalestinianDataItem[];
  // quizzes: QuizQuestion[]; // Removed - Quizzes now loaded via quizService.ts
}

export const palestinianData: PalestinianData = {
  proverbs: [
    {
      arabic: "إيد لوحدها ما بتزقفش.",
      english: "One hand cannot clap alone. (Emphasizes unity and cooperation)"
    },
    {
      arabic: "القرد بعين أمه غزال.",
      english: "In his mother's eyes, a monkey is a gazelle. (Beauty is subjective)"
    },
    {
      arabic: "الصبر مفتاح الفرج.",
      english: "Patience is the key to relief. (Importance of perseverance)"
    }
  ],
  culturalFacts: [
    {
      arabic: "التطريز الفلسطيني (التطريز) هو شكل فني غني يحكي قصص القرى والهوية من خلال الأنماط والألوان.",
      english: "Palestinian embroidery (Tatreez) is a rich art form that tells stories of villages and identity through patterns and colors."
    },
    {
      arabic: "شجرة الزيتون هي رمز عميق الجذور للمقاومة الفلسطينية والارتباط بالأرض.",
      english: "The olive tree is a deep-rooted symbol of Palestinian resilience and connection to the land."
    },
    {
      arabic: "الدبكة هي رقصة فولكلورية فلسطينية تقليدية يتم أداؤها في الاحتفالات، وتتميز بحركات القدم الإيقاعية والعمل الجماعي.",
      english: "Dabke is a traditional Palestinian folk dance performed at celebrations, characterized by rhythmic footwork and group unity."
    }
  ],
  // quizzes array removed, data is now loaded via quizService.ts
};