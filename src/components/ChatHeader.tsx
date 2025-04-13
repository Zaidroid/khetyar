import { Globe, Moon, Sun, Info, BookOpen, CalendarClock } from "lucide-react";
import GlossaryDisplay from "./GlossaryDisplay";
import TimelineDisplay from "./TimelineDisplay";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ChatHeaderProps {
  language: "arabic" | "english";
  setLanguage: (language: "arabic" | "english") => void;
  userName?: string | null;
}

const ChatHeader = ({ language, setLanguage, userName }: ChatHeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === "arabic" ? "english" : "arabic");
  };

  return (
    <header className="flex items-center justify-between p-2 sm:p-4 border-b border-border">
      {/* Left Side: Logo and Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-base sm:text-lg">خ</span>
        </div>
        <h1 className={cn(
          "text-lg sm:text-xl font-semibold hidden sm:block", // Added font-semibold
          language === "arabic" ? "font-arabic" : "font-english"
        )}>
          {language === "arabic" ? "ختيار - راوي قصص فلسطيني" : "Khetyar - Palestinian Storyteller"}
        </h1>
        {/* Mobile Title */}
        <h1 className={cn(
          "text-lg font-semibold sm:hidden", // Added font-semibold
          language === "arabic" ? "font-arabic" : "font-english"
        )}>
          {language === "arabic" ? "ختيار" : "Khetyar"}
        </h1>
      </div>

      {/* Right Side: Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>

        {/* Language Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 border-x px-1 sm:px-2">
          <Globe size={16} className="text-secondary" />
          <span className={cn(
            "text-xs sm:text-sm",
            language === "arabic" ? "font-arabic" : "font-english"
          )}>
            {language === "arabic" ? "العربية" : "English"}
          </span>
          <Switch
            checked={language === "english"}
            onCheckedChange={toggleLanguage}
            aria-label="Toggle language"
          />
        </div>

        {/* Help Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Help">
              <Info className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </DialogTrigger>
          <DialogContent className={cn("sm:max-w-[425px]", language === 'arabic' ? 'font-arabic direction-rtl' : 'font-english direction-ltr')}>
            <DialogHeader>
              <DialogTitle>{language === 'arabic' ? 'مساعدة' : 'Help'}</DialogTitle>
              <DialogDescription className={cn(language === 'arabic' ? 'text-right' : 'text-left')}>
                {language === 'arabic'
                  ? 'أنا أبو خليل، راوي قصص فلسطيني. اسألني عن:'
                  : 'I am Abu Khalil, a Palestinian storyteller. Ask me about:'}
              </DialogDescription>
            </DialogHeader>
            <ul className={cn("list-disc space-y-2 py-4", language === 'arabic' ? 'pr-6 text-right' : 'pl-6 text-left')}>
              <li>{language === 'arabic' ? 'التاريخ والثقافة الفلسطينية' : 'Palestinian history and culture'}</li>
              <li>{language === 'arabic' ? 'الحياة اليومية والتقاليد' : 'Daily life and traditions'}</li>
              <li>{language === 'arabic' ? 'ذكرياتي وقصصي الشخصية' : 'My memories and personal stories'}</li>
            </ul>
            <p className={cn("text-sm text-muted-foreground", language === 'arabic' ? 'text-right' : 'text-left')}>
              {language === 'arabic'
                ? 'يمكنك أيضًا النقر على الأزرار أدناه لطلب قصة أو اختبار قصير!'
                : 'You can also click the buttons below to request a story or a quiz!'}
            </p>
          </DialogContent>
        </Dialog>

        {/* Glossary Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Glossary">
              <BookOpen className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </DialogTrigger>
          <DialogContent className={cn("sm:max-w-lg", language === 'arabic' ? 'font-arabic direction-rtl' : 'font-english direction-ltr')}>
            <DialogHeader>
              <DialogTitle>{language === 'arabic' ? 'معجم المصطلحات' : 'Glossary'}</DialogTitle>
              <DialogDescription className={cn(language === 'arabic' ? 'text-right' : 'text-left')}>
                {language === 'arabic' ? 'مصطلحات فلسطينية شائعة وتعريفاتها.' : 'Common Palestinian terms and their definitions.'}
              </DialogDescription>
            </DialogHeader>
            <GlossaryDisplay language={language} />
          </DialogContent>
        </Dialog>

        {/* Timeline Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Timeline">
              <CalendarClock className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </DialogTrigger>
          <DialogContent className={cn("sm:max-w-2xl", language === 'arabic' ? 'font-arabic direction-rtl' : 'font-english direction-ltr')}>
            <DialogHeader>
              <DialogTitle>{language === 'arabic' ? 'الخط الزمني التاريخي' : 'Historical Timeline'}</DialogTitle>
              <DialogDescription className={cn(language === 'arabic' ? 'text-right' : 'text-left')}>
                {language === 'arabic' ? 'أحداث رئيسية في التاريخ الفلسطيني.' : 'Key events in Palestinian history.'}
              </DialogDescription>
            </DialogHeader>
            <TimelineDisplay language={language} />
          </DialogContent>
        </Dialog>

      </div> {/* End of right-side buttons container */}
    </header>
  );
};

export default ChatHeader;
