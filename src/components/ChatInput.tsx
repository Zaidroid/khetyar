
import { useState, useRef, useEffect } from "react";
import { Send, BookOpen, HelpCircle } from "lucide-react"; // Added BookOpen, HelpCircle
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  language: "arabic" | "english";
  isLoading: boolean;
  onStoryRequested?: () => void; // Callback for story request button click
}

const ChatInput = ({ onSendMessage, language, isLoading, onStoryRequested }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus the textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      
      // Re-focus the textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStoryRequest = () => {
    const storyPrompt = language === "arabic"
      ? "احكِ لي قصة من ذكرياتك يا أبو خليل."
      : "Tell me a story from your memories, Abu Khalil.";
    onSendMessage(storyPrompt);
    onStoryRequested?.(); // Notify parent component
  };

  const handleQuizRequest = () => {
    const quizPrompt = language === "arabic"
      ? "اسألني سؤالاً لاختبار معرفتي عن فلسطين يا أبو خليل."
      : "Ask me a quiz question about Palestine, Abu Khalil.";
    onSendMessage(quizPrompt);
  };

  const placeholder = language === "arabic" 
    ? "اسأل الختيار عن القصص والتراث الفلسطيني..."
    : "Ask Khetyar about Palestinian stories and heritage...";

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 z-20 w-full flex justify-center bg-transparent"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className={cn(
          "w-full max-w-2xl mx-auto flex gap-2 items-end p-2 sm:p-4",
          "rounded-2xl shadow-lg border border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          "transition-all",
          "mb-2"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "min-h-[50px] sm:min-h-[60px] max-h-[120px] sm:max-h-[180px] resize-none text-sm sm:text-base bg-input text-foreground border-border focus-visible:ring-ring rounded-xl shadow-none",
            language === "arabic" ? "direction-rtl font-arabic" : "direction-ltr font-english"
          )}
          disabled={isLoading}
          aria-label={language === "arabic" ? "رسالتك" : "Your message"}
        />
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center h-[50px] sm:h-[60px] w-10 flex-shrink-0">
            <div className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse-slow" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse-slow" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse-slow" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        {/* Quiz Request Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] rounded-full flex-shrink-0 border-secondary text-secondary hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background"
          onClick={handleQuizRequest}
          disabled={isLoading}
          aria-label={language === "arabic" ? "اطلب اختباراً" : "Request a quiz"}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
        {/* Story Request Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] rounded-full flex-shrink-0 border-secondary text-secondary hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background"
          onClick={handleStoryRequest}
          disabled={isLoading}
          aria-label={language === "arabic" ? "اطلب قصة" : "Request a story"}
        >
          <BookOpen className="h-5 w-5" />
        </Button>
        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] rounded-full flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow"
          disabled={!message.trim() || isLoading}
          aria-label={language === "arabic" ? "إرسال" : "Send"}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
