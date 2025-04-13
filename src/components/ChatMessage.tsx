
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import Avatar from './Avatar';
import { ThumbsUp, ThumbsDown } from 'lucide-react'; // Import feedback icons
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/data/palestinianData"; // Import quiz type

interface ChatMessageProps {
  messageId: string;
  messageText: string;
  isKhetyar: boolean;
  language: "arabic" | "english";
  feedback?: 'like' | 'dislike' | null;
  onFeedback: (messageId: string, feedbackType: 'like' | 'dislike') => void;
  quizData?: QuizQuestion; // Optional quiz data
  onSendMessage?: (message: string) => void; // Optional send message for quiz answers
  isLoading?: boolean; // Optional loading state for disabling quiz buttons
}

const ChatMessage = ({
  messageId,
  messageText,
  isKhetyar,
  language,
  feedback,
  onFeedback,
  quizData,
  onSendMessage,
  isLoading
}: ChatMessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to show newly added messages
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageText]); // Update dependency

  return (
    <div
      ref={messageRef}
      className={cn(
        "flex items-end gap-2 mb-4 animate-fade-in", // Added flex, gap, margin
        isKhetyar ? "justify-start" : "justify-end" // Align based on sender
      )}
    >
      {isKhetyar && (
        <Avatar src="/abu-khalil.jpeg" alt="Abu Khalil Avatar" />
      )}
      <div
        className={cn(
          "chat-bubble",
          isKhetyar
            ? "khetyar bg-primary text-primary-foreground" // Khetyar uses primary color
            : "user bg-card text-card-foreground", // User uses card background
          "max-w-[75%] sm:max-w-[60%]" // Limit bubble width
        )}
      >
        {/* Conditionally render Quiz or Normal Message */}
        {isKhetyar && quizData ? (
          // Quiz Question Rendering
          <div className={cn(language === "arabic" ? "direction-rtl font-arabic text-right" : "direction-ltr font-english text-left")}>
            <p className="whitespace-pre-wrap mb-3 font-semibold">{quizData.question[language]}</p> {/* Make question bold */}
            <div className="flex flex-col gap-2 items-stretch">
              {quizData.options.map((option, index) => (
                <Button
                  key={index}
                  // variant="outline" // Remove outline
                  className={cn(
                    "justify-start text-left h-auto py-2 px-3 whitespace-normal bg-card hover:bg-muted/50 border border-border", // Add background, hover, border
                    language === "arabic" ? "text-right" : "text-left"
                  )}
                  onClick={() => onSendMessage?.((index + 1).toString())}
                  disabled={isLoading}
                >
                  {index + 1}. {option[language]}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-2 border-t border-border/50"> {/* Add more margin and subtle top border */}
              {language === 'arabic' ? "أرسل رقم الإجابة الصحيحة." : "Send the number of the correct answer."}
            </p>
          </div>
        ) : (
          // Normal Message Rendering
          <>
            <p className={cn(
              "whitespace-pre-wrap",
              language === "arabic" ? "direction-rtl font-arabic text-right" : "direction-ltr font-english text-left" // Apply font based on language only
            )}>
              {messageText}
            </p>
            {/* Feedback and Name Section */}
            {isKhetyar && (
              <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/10">
                {/* Feedback Buttons */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 text-muted-foreground hover:text-primary rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", // Added focus ring
                      feedback === 'like' && "text-green-600 dark:text-green-400 bg-green-500/10" // Use theme-based green
                    )}
                    onClick={() => onFeedback(messageId, 'like')}
                    aria-label="Like message"
                  >
                    <ThumbsUp size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 text-muted-foreground hover:text-destructive rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", // Added focus ring
                      feedback === 'dislike' && "text-red-600 dark:text-red-400 bg-red-500/10" // Use theme-based red
                    )}
                    onClick={() => onFeedback(messageId, 'dislike')}
                    aria-label="Dislike message"
                  >
                    <ThumbsDown size={14} />
                  </Button>
                </div>
                {/* Name */}
                <div className={cn(
                  "text-xs opacity-70", // Remove fixed font-english
                  language === "arabic" ? "font-arabic" : "font-english", // Apply font based on language
                  language === "arabic" ? "text-left" : "text-right"
                )}>
                  {language === "arabic" ? "أبو خليل" : "Abu Khalil"}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {!isKhetyar && (
        // Optional: Add a placeholder or user avatar here if needed
        <div className="w-8 h-8 sm:w-10 sm:h-10"></div> // Spacer to align user messages
      )}
    </div>
  );
};

export default ChatMessage;
