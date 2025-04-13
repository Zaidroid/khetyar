import { timelineEvents } from '@/services/knowledgeService'; // Assuming timelineEvents is exported
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface TimelineDisplayProps {
  language: "arabic" | "english";
}

// Define the structure of a timeline entry (adjust if needed)
interface TimelineEvent {
  id: string;
  year: number | string; // Allow string for date ranges etc.
  title_arabic: string;
  title_english: string;
  description_arabic: string;
  description_english: string;
  keywords?: string[];
  related_knowledge_ids?: string[];
}

const TimelineDisplay = ({ language }: TimelineDisplayProps) => {
  // Ensure timelineEvents is treated as the correct type and sort by year
  const sortedEvents = (timelineEvents as TimelineEvent[]).sort((a, b) => {
    const yearA = typeof a.year === 'string' ? parseInt(a.year.split('-')[0], 10) : a.year;
    const yearB = typeof b.year === 'string' ? parseInt(b.year.split('-')[0], 10) : b.year;
    return yearA - yearB;
  });

  return (
    <div className={cn("h-[60vh] flex flex-col", language === 'arabic' ? 'font-arabic' : 'font-english')}>
      <ScrollArea className="flex-1 pr-4"> {/* Added padding-right for scrollbar */}
        <div className="relative pl-6 border-l-2 border-border ml-3"> {/* Timeline line */}
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event, index) => (
              <div key={event.id || index} className="mb-8 relative">
                {/* Dot on the timeline */}
                <div className="absolute -left-[7px] top-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>

                <Card className="ml-6"> {/* Offset card from line */}
                  <CardHeader>
                    <CardTitle className={cn("text-lg", language === 'arabic' ? 'text-right' : 'text-left')}>
                      <span className="font-bold mr-2">{event.year}</span> - {language === 'arabic' ? event.title_arabic : event.title_english}
                    </CardTitle>
                    <CardDescription className={cn("pt-1", language === 'arabic' ? 'text-right' : 'text-left')}>
                      {language === 'arabic' ? event.description_arabic : event.description_english}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground mt-4">
              {language === 'arabic' ? 'لم يتم تحميل بيانات الخط الزمني.' : 'Timeline data not loaded.'}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TimelineDisplay;