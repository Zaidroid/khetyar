import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import Avatar from './Avatar';

interface Message {
  id: string;
  text: string;
  isKhetyar: boolean;
  feedback?: 'like' | 'dislike' | null; // Include feedback from parent
  quizData?: any; // Keep quizData flexible for now
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollLock, setScrollLock] = useState(false);
  const isMobile = useIsMobile();

  // Track scroll position
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [atBottom, setAtBottom] = useState(true);

  // Enhanced scroll management with debouncing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setPrevScrollPos(scrollTop);
      setAtBottom(scrollHeight - scrollTop - clientHeight < 50);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to bottom logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container || scrollLock) return;

    if (atBottom || messages.length <= 1) {
      const scrollTo = () => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      };

      // Delay slightly to allow DOM updates
      const timer = setTimeout(scrollTo, 50);
      return () => clearTimeout(timer);
    } else {
      // Maintain scroll position when not at bottom
      container.scrollTop = prevScrollPos;
    }
  }, [messages, scrollLock, atBottom, prevScrollPos]);

  // Touch event handlers for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMobile) return;

    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      const diff = startY - y;
      if (Math.abs(diff) > 5) {
        isScrolling = true;
        setScrollLock(true);
      }
    };

    const handleTouchEnd = () => {
      if (isScrolling) {
        setTimeout(() => {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
          setScrollLock(!nearBottom);
        }, 300);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile]);

  return (
    // Increased bottom padding (pb-20 sm:pb-24) to accommodate input height
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 pb-4 sm:pb-6 chat-messages touch-pan-y"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable',
        scrollBehavior: 'smooth',
        scrollSnapType: isMobile ? 'y mandatory' : 'y proximity'
      }}
      tabIndex={0}
      aria-label="Chat messages"
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.length === 0 ? (
        // Initial welcome message if no messages yet
        <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-scale">
            <span className="text-primary font-bold text-2xl sm:text-3xl">خ</span>
          </div>
          <h2 className={cn(
            "text-lg sm:text-xl mb-2 font-semibold", // Added font-semibold
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
        // Render messages
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            messageId={message.id}
            messageText={message.text}
            isKhetyar={message.isKhetyar}
            language={language}
            feedback={message.feedback}
            onFeedback={onFeedback}
            quizData={message.quizData} // Pass quiz data if present
            onSendMessage={onSendMessage}
            isLoading={isLoading}
          />
        ))
      )}

      {/* Loading indicator is now handled in ChatInput */}

      {/* Empty div to ensure scrolling to the bottom works */}
      {/* Typing indicator */}
      {isLoading && messages.length > 0 && !messages[messages.length - 1].isKhetyar && (
        <div className="flex items-end gap-2 mb-4 animate-fade-in">
          <Avatar src="/abu-khalil.jpeg" alt="Abu Khalil Avatar" />
          <div className="rounded-2xl shadow-md px-4 py-3 bg-primary text-primary-foreground max-w-[75%] sm:max-w-[60%] flex items-center">
            <span className="inline-flex space-x-1">
              <span className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />

      {/* Scroll-to-bottom FAB */}
      <div
        className={cn(
          "pointer-events-none",
          "fixed bottom-24 right-4 sm:bottom-28 sm:right-8 z-40",
          "transition-all duration-300",
          atBottom
            ? "opacity-0 translate-y-4 scale-95"
            : "opacity-100 translate-y-0 scale-100 pointer-events-auto"
        )}
        aria-hidden={atBottom}
      >
        <button
          className="bg-primary text-primary-foreground rounded-full shadow-xl p-3 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => {
            containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
          }}
          aria-label={language === "arabic" ? "انتقل لأسفل" : "Scroll to bottom"}
          tabIndex={atBottom ? -1 : 0}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16l-6-6m12 0l-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;
