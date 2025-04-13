
import { useState, useEffect } from "react"; // Added useEffect
import { v4 as uuidv4 } from 'uuid';
import ChatHeader from "@/components/ChatHeader";
import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";
import EmbroideryPattern from "@/components/EmbroideryPattern";
import TopicSuggestions from "@/components/TopicSuggestions"; // Import TopicSuggestions
import { sendMessage, ChatResponse } from "@/services/chatService"; // Import ChatResponse
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Import cn utility
import type { QuizQuestion, PalestinianDataItem } from "@/data/palestinianData"; // Import quiz types

interface Message {
  id: string;
  text: string;
  isKhetyar: boolean;
  feedback?: 'like' | 'dislike' | null;
  quizData?: QuizQuestion; // Add optional quiz data
}

const Index = () => {
  // Default to Arabic
  const [language, setLanguage] = useState<"arabic" | "english">("arabic");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [userName, setUserName] = useState<string | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [tempName, setTempName] = useState("");
  const [activeQuiz, setActiveQuiz] = useState<{ correctAnswerIndex: number; explanation?: PalestinianDataItem } | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false); // State to control topic button visibility
  // Achievement State
  const [storyCount, setStoryCount] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  // Check for stored user name on mount
  // Load initial state from localStorage
  useEffect(() => {
    // User Name
    const storedName = localStorage.getItem("khetyarUserName");
    if (storedName) {
      setUserName(storedName);
      setShowNameInput(false);
    } else {
      setShowNameInput(true);
      setShowTopicSuggestions(false); // Ensure suggestions are hidden initially
    }
    // Achievements
    const storedStoryCount = parseInt(localStorage.getItem("khetyarStoryCount") || "0", 10);
    const storedQuizCorrectCount = parseInt(localStorage.getItem("khetyarQuizCorrectCount") || "0", 10);
    const storedUnlocked = JSON.parse(localStorage.getItem("khetyarUnlockedAchievements") || "[]");
    setStoryCount(storedStoryCount);
    setQuizCorrectCount(storedQuizCorrectCount);
    setUnlockedAchievements(storedUnlocked);
  }, []);

  // Set HTML direction based on language
  useEffect(() => {
    document.documentElement.dir = language === 'arabic' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'arabic' ? 'ar' : 'en'; // Also update lang attribute
  }, [language]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      const nameToSave = tempName.trim();
      localStorage.setItem("khetyarUserName", nameToSave);
      setUserName(nameToSave);
      setShowNameInput(false);
      setTempName("");
      setShowTopicSuggestions(true); // Show suggestions after name submit

      // Add initial greeting messages
      const detailedGreeting = language === 'arabic'
        ? `أهلاً بك يا ${nameToSave}. أنا أبو خليل، راوي قصص فلسطيني. عشت طويلاً ورأيت الكثير. تفضل بالجلوس واسألني عن تاريخنا، ثقافتنا، أرضنا، أو استمع لإحدى ذكرياتي.`
        : `Ahlan ya ${nameToSave}. I am Abu Khalil, a Palestinian storyteller. I have lived long and seen much. Sit and ask me about our history, culture, land, or listen to one of my memories.`;

      const suggestionText = language === 'arabic'
        ? `يمكنك أن تبدأ بسؤالي:\n- "احكِ لي قصة"\n- "ما هي النكبة؟"\n- "ما هو التطريز الفلسطيني؟"`
        : `You could start by asking:\n- "Tell me a story"\n- "What is the Nakba?"\n- "What is Palestinian Tatreez?"`;

      const greetingMessage: Message = {
        id: uuidv4(),
        text: detailedGreeting,
        isKhetyar: true
      };
      const suggestionMessage: Message = {
        id: uuidv4(),
        text: suggestionText,
        isKhetyar: true // Displayed as if from Abu Khalil
      };
      setMessages([greetingMessage, suggestionMessage]); // Start chat with greeting and suggestions
    }
  };

  const handleSendMessage = async (text: string, isTopicSelection = false) => { // Add flag for topic selection clicks
    const trimmedText = text.trim();
    if (!trimmedText) return;

    // Hide topic suggestions on first actual message or if a topic was just selected
    if (showTopicSuggestions && !isTopicSelection) {
      setShowTopicSuggestions(false);
    }

    // --- Quiz Answer Handling ---
    if (activeQuiz) {
      const answerNumber = parseInt(trimmedText, 10);
      let feedbackText = "";

      // Add user's answer message first
      const userAnswerMessage: Message = { id: uuidv4(), text: trimmedText, isKhetyar: false };
      setMessages(prev => [...prev, userAnswerMessage]);

      if (!isNaN(answerNumber) && answerNumber > 0) { // Basic validation
        const answerIndex = answerNumber - 1; // Convert to 0-based index
        const isCorrect = answerIndex === activeQuiz.correctAnswerIndex;
        if (isCorrect) {
          feedbackText = language === 'arabic' ? "✅ صحيح! أحسنت." : "✅ Correct! Well done.";
          // Increment correct quiz count & check achievements
          const newCount = quizCorrectCount + 1;
          setQuizCorrectCount(newCount);
          localStorage.setItem("khetyarQuizCorrectCount", newCount.toString());
          checkAndNotifyAchievement(newCount, 'quiz');
        } else {
          feedbackText = language === 'arabic'
            ? `❌ ليس تماماً. الإجابة الصحيحة كانت ${activeQuiz.correctAnswerIndex + 1}.`
            : `❌ Not quite. The correct answer was ${activeQuiz.correctAnswerIndex + 1}.`;
        }
        // Add explanation if available
        if (activeQuiz.explanation) {
          feedbackText += `\n\n---\n${language === 'arabic' ? '**توضيح:**' : '**Explanation:**'}\n${activeQuiz.explanation[language]}`; // Added separator and bold
        }
      } else {
        feedbackText = language === 'arabic' ? "لم أفهم إجابتك. الرجاء إرسال رقم الخيار الصحيح." : "I didn't understand your answer. Please send the number of the correct option.";
      }

      const feedbackMessage: Message = {
        id: uuidv4(),
        text: feedbackText,
        isKhetyar: true
      };
      setMessages(prev => [...prev, feedbackMessage]);
      setActiveQuiz(null); // Reset quiz state
      return; // Stop processing, don't send answer to backend
    }
    // --- End Quiz Answer Handling ---

    // Add user message to chat (only if it's not a topic selection 'click')
    if (!isTopicSelection) {
      const userMessage: Message = {
        id: uuidv4(),
        text: trimmedText,
        isKhetyar: false
      };
      setMessages(prev => [...prev, userMessage]);
    }
    setIsLoading(true);

    try {
      // Always enforce Palestinian dialect for Arabic
      let promptToSend = trimmedText;
      if (language === "arabic") {
        promptToSend = `اكتب باللهجة الفلسطينية فقط: ${trimmedText}`;
      }
      // Get response from chatbot service, passing current history
      // Pass currentTopic state to sendMessage
      const response: ChatResponse = await sendMessage(promptToSend, language, messages, currentTopic);

      // Check for quiz data in response
      if (response.quizData) {
        setActiveQuiz({
          correctAnswerIndex: response.quizData.correctAnswerIndex,
          explanation: response.quizData.explanation
        });
      }

      // Add Khetyar's response message (could be text or quiz question)
      // Update topic state if detected by chatService
      if (response.detectedTopicId) {
        setCurrentTopic(response.detectedTopicId);
      }
      // Add the response message (could be confirmation or actual answer)
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Error getting response:", error);

      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        text: language === "arabic"
          ? "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى."
          : "Sorry, there was an error connecting. Please try again.",
        isKhetyar: true
      };

      setMessages(prev => [...prev, errorMessage]);

      // Show toast notification
      toast({
        title: language === "arabic" ? "خطأ" : "Error",
        description: language === "arabic"
          ? "حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى."
          : "Connection error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (messageId: string, feedbackType: 'like' | 'dislike') => {
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          // Toggle feedback: if same feedback is clicked again, remove it
          const newFeedback = msg.feedback === feedbackType ? null : feedbackType;
          return { ...msg, feedback: newFeedback };
        }
        return msg;
      })
    );
    // TODO: Send feedback data to a backend/analytics service here
    console.log(`Feedback for message ${messageId}: ${feedbackType}`);
  };

  // --- Achievement Logic ---
  const achievements = [
    { id: 'story1', name: 'First Story', description: 'Listened to your first story from Abu Khalil.', threshold: 1, counterKey: 'story' },
    { id: 'story3', name: 'Story Seeker', description: 'Listened to 3 stories from Abu Khalil.', threshold: 3, counterKey: 'story' },
    { id: 'quiz1', name: 'Quiz Beginner', description: 'Answered your first quiz question correctly.', threshold: 1, counterKey: 'quiz' },
    { id: 'quiz5', name: 'Quiz Master', description: 'Answered 5 quiz questions correctly.', threshold: 5, counterKey: 'quiz' },
  ];

  const checkAndNotifyAchievement = (currentCount: number, type: 'story' | 'quiz') => {
    achievements.forEach(ach => {
      if (ach.counterKey === type && currentCount >= ach.threshold && !unlockedAchievements.includes(ach.id)) {
        const newUnlocked = [...unlockedAchievements, ach.id];
        setUnlockedAchievements(newUnlocked);
        localStorage.setItem("khetyarUnlockedAchievements", JSON.stringify(newUnlocked));
        
        // Notify user
        toast({
          title: language === 'arabic' ? `إنجاز جديد: ${ach.name}` : `Achievement Unlocked: ${ach.name}`,
          description: language === 'arabic' ? ach.description : ach.description, // Assuming descriptions are simple enough or add arabic versions
          duration: 5000,
        });
      }
    });
  };

  const handleStoryRequested = () => {
    const newCount = storyCount + 1;
    setStoryCount(newCount);
    localStorage.setItem("khetyarStoryCount", newCount.toString());
    checkAndNotifyAchievement(newCount, 'story');
  };
  // --- End Achievement Logic ---

  // --- Topic Selection Logic ---
  const handleSelectTopic = (topicId: string, topicName: string) => {
    setCurrentTopic(topicId);
    setShowTopicSuggestions(false); // Hide buttons after selection
    // Send a message confirming the topic selection
    const confirmationText = language === 'arabic'
      ? `حسناً، لنتحدث عن ${topicName}. ماذا تود أن تعرف؟`
      : `Okay, let's talk about ${topicName}. What would you like to know?`;
    // We use handleSendMessage directly but flag it as a non-user message initially
    // Or, more simply, add a confirmation message directly
     const confirmationMessage: Message = {
        id: uuidv4(),
        text: confirmationText,
        isKhetyar: true
      };
      setMessages(prev => [...prev, confirmationMessage]);
     // Optionally trigger the first API call for the topic immediately
     // handleSendMessage(`Tell me about ${topicName}`, true); // Pass true to indicate it's a topic selection click
  };
  // --- End Topic Selection Logic ---

  // Render name input overlay if needed
  if (showNameInput) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <form onSubmit={handleNameSubmit} className="p-8 bg-card rounded-lg shadow-lg text-center max-w-sm w-full">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'arabic' ? 'أهلاً بك في خيمة أبو خليل' : 'Welcome to Abu Khalil\'s Tent'}
          </h2>
          {/* Added Introduction */}
          <p className={cn("mb-4 text-sm text-muted-foreground", language === 'arabic' ? 'font-arabic' : 'font-english')}>
            {language === 'arabic'
              ? 'أنا أبو خليل، راوي قصص فلسطيني. عشت طويلاً ورأيت الكثير. تفضل بالجلوس واسألني عن تاريخنا، ثقافتنا، أرضنا، أو استمع لإحدى ذكرياتي.'
              : 'I am Abu Khalil, a Palestinian storyteller. I have lived long and seen much. Sit and ask me about our history, culture, land, or listen to one of my memories.'}
          </p>
          <p className="mb-6 text-muted-foreground">
            {language === 'arabic' ? 'ما اسمك يا بني/ابنتي؟' : 'What is your name, my child?'}
          </p>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder={language === 'arabic' ? 'أدخل اسمك هنا' : 'Enter your name here'}
            className="w-full p-2 border rounded mb-4 bg-input text-foreground"
            required
          />
          {/* Conditionally render Topic Suggestions */}
          {showTopicSuggestions && messages.length >= 2 && ( // Show only after initial greetings
            <TopicSuggestions language={language} onSelectTopic={handleSelectTopic} />
          )}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 transition-colors" // Use theme primary color
          >
            {language === 'arabic' ? 'تأكيد' : 'Confirm'}
          </button>
          {/* Optional: Add language toggle here too */}
        </form>
      </div>
    );
  }

  // Render chat interface if name is known
  return (
    <div className="flex flex-col h-screen bg-background">
      <EmbroideryPattern className="from-khetyar-red" />
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 shadow-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all">
        <ChatHeader language={language} setLanguage={setLanguage} userName={userName} />
      </div>
      {/* Chat Area (scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ChatContainer
          messages={messages}
          language={language}
          isLoading={isLoading}
          onFeedback={handleFeedback}
          onSendMessage={handleSendMessage}
        />
      </div>
      {/* Sticky Input */}
      <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all">
        <ChatInput
          onSendMessage={handleSendMessage}
          language={language}
          isLoading={isLoading}
          onStoryRequested={handleStoryRequested}
        />
      </div>
      <EmbroideryPattern className="from-khetyar-olive" />
    </div>
  );
};

export default Index;
