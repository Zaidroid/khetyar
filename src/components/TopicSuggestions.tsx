import { Button } from "@/components/ui/button";
import { TOPICS, TopicInfo } from "@/data/topics"; // Import topics definition
import { cn } from "@/lib/utils";

interface TopicSuggestionsProps {
  language: "arabic" | "english";
  onSelectTopic: (topicId: string, topicName: string) => void;
}

// Define which topics to show as initial suggestions
const SUGGESTED_TOPIC_KEYS: (keyof typeof TOPICS)[] = [
  'HISTORY',
  'CULTURE',
  'FOOD',
  'DAILY_LIFE',
  // Add more keys if desired
];

const TopicSuggestions = ({ language, onSelectTopic }: TopicSuggestionsProps) => {
  const suggestedTopics = SUGGESTED_TOPIC_KEYS.map(key => TOPICS[key]);

  const handleTopicClick = (topic: TopicInfo) => {
    const topicName = language === 'arabic' ? topic.arabic : topic.english;
    onSelectTopic(topic.id, topicName);
  };

  return (
    <div className={cn(
        "px-2 sm:px-4 pb-2 flex flex-wrap justify-center gap-2 animate-fade-in",
        language === 'arabic' ? 'font-arabic' : 'font-english'
      )}
    >
      <p className="w-full text-center text-sm text-muted-foreground mb-1">
        {language === 'arabic' ? 'أو اختر موضوعًا للبدء:' : 'Or select a topic to start:'}
      </p>
      {suggestedTopics.map((topic) => (
        <Button
          key={topic.id}
          variant="outline"
          size="sm"
          className="bg-card hover:bg-muted/50"
          onClick={() => handleTopicClick(topic)}
        >
          {language === 'arabic' ? topic.arabic : topic.english}
        </Button>
      ))}
    </div>
  );
};

export default TopicSuggestions;