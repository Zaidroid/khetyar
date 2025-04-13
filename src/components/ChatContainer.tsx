
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  isKhetyar: boolean;
  feedback?: 'like' | 'dislike' | null; // Include feedback from parent
}

interface ChatContainerProps {
  messages: Message[];
  language: "arabic" | "english";
  isLoading: boolean;
  onFeedback: (messageId: string, feedbackType: 'like' | 'dislike') => void;
  onSendMessage: (message: string) => void; // Add send message handler for quiz answers
}

const ChatContainer = ({ messages, language, isLoading, onFeedback, onSendMessage }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 pb-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-khetyar-red bg-opacity-10 rounded-full flex items-center justify-center mb-4 animate-scale">
            <span className="text-khetyar-red font-bold text-2xl sm:text-3xl">خ</span>
          </div>
          <h2 className={cn(
            "text-lg sm:text-xl mb-2", 
            language === "arabic" ? "font-arabic" : "font-english"
          )}>
            {language === "arabic" ? "مرحباً بك" : "Welcome"}
          </h2>
          <p className={cn(
            "text-sm sm:text-base text-muted-foreground max-w-md", 
            language === "arabic" ? "font-arabic" : "font-english"
          )}>
            {language === "arabic" 
              ? "أنا أبو خليل. اسألني عن التاريخ والثقافة والحياة في فلسطين."
              : "I am Abu Khalil. Ask me about history, culture, and life in Palestine."
            }
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            messageId={message.id} // Pass message ID
            messageText={message.text} // Rename prop to avoid conflict
            isKhetyar={message.isKhetyar}
            language={language}
            feedback={message.feedback} // Pass current feedback state
            onFeedback={onFeedback}
            onSendMessage={onSendMessage} // Pass send message handler
            isLoading={isLoading} // Pass loading state
          />
        ))
      )}
      
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;
