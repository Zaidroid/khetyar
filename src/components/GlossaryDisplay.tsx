import { useState } from 'react';
import { glossaryEntries } from '@/services/knowledgeService'; // Assuming glossaryEntries is exported
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

interface GlossaryDisplayProps {
  language: "arabic" | "english";
}

// Define the structure of a glossary entry to match glossary.json
interface GlossaryEntry {
  id: string; // Added id
  term_arabic: string;
  term_transliterated: string; // Use term_transliterated instead of term_english
  definition_arabic: string;
  definition_english: string;
  keywords: string[]; // English keywords
  arabic_keywords: string[]; // Arabic keywords
}

const GlossaryDisplay = ({ language }: GlossaryDisplayProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Ensure glossaryEntries is treated as the correct type
  const typedGlossaryEntries = glossaryEntries as GlossaryEntry[];

  const filteredEntries = typedGlossaryEntries.filter(entry => {
    const term = language === 'arabic' ? entry.term_arabic : entry.term_transliterated; // Use term_transliterated
    const definition = language === 'arabic' ? entry.definition_arabic : entry.definition_english;
    const lowerSearchTerm = searchTerm.toLowerCase();
    // Combine all keywords for searching
    const allKeywords = [...(entry.keywords || []), ...(entry.arabic_keywords || [])];

    return (
      term.toLowerCase().includes(lowerSearchTerm) ||
      definition.toLowerCase().includes(lowerSearchTerm) ||
      allKeywords.some(kw => kw.toLowerCase().includes(lowerSearchTerm))
    );
  }).sort((a, b) => {
    // Sort alphabetically based on the current language term
    const termA = language === 'arabic' ? a.term_arabic : a.term_transliterated; // Use term_transliterated
    const termB = language === 'arabic' ? b.term_arabic : b.term_transliterated; // Use term_transliterated
    return termA.localeCompare(termB);
  });

  return (
    <div className={cn("flex flex-col h-[60vh]", language === 'arabic' ? 'font-arabic' : 'font-english')}>
      <Input
        type="text"
        placeholder={language === 'arabic' ? 'ابحث في المصطلحات...' : 'Search terms...'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <ScrollArea className="flex-1 pr-4"> {/* Added padding-right for scrollbar */}
        {filteredEntries.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {filteredEntries.map((entry, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className={cn(language === 'arabic' ? 'text-right' : 'text-left')}> {/* Ensure trigger text aligns */}
                  {language === 'arabic' ? entry.term_arabic : entry.term_transliterated} {/* Use term_transliterated */}
                </AccordionTrigger>
                <AccordionContent className={cn(language === 'arabic' ? 'text-right' : 'text-left')}>
                  <p className="whitespace-pre-wrap">
                    {language === 'arabic' ? entry.definition_arabic : entry.definition_english}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-center text-muted-foreground mt-4">
            {language === 'arabic' ? 'لم يتم العثور على مصطلحات مطابقة.' : 'No matching terms found.'}
          </p>
        )}
      </ScrollArea>
    </div>
  );
};

export default GlossaryDisplay;