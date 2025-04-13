export interface TopicInfo {
  id: string;
  arabic: string;
  english: string;
  keywords: string[]; // Keywords for command matching (include both languages)
}

export const TOPICS: Record<string, TopicInfo> = {
  HISTORY: {
    id: 'history',
    arabic: 'التاريخ',
    english: 'History',
    keywords: ['history', 'historical', 'past', 'تاريخ', 'تاريخي', 'ماضي']
  },
  CULTURE: {
    id: 'culture',
    arabic: 'الثقافة والتراث',
    english: 'Culture & Heritage',
    keywords: ['culture', 'cultural', 'heritage', 'traditions', 'customs', 'ثقافة', 'ثقافي', 'تراث', 'تقاليد', 'عادات']
  },
  FOOD: {
    id: 'food',
    arabic: 'الطعام والمطبخ',
    english: 'Food & Cuisine',
    keywords: ['food', 'cuisine', 'recipes', 'dishes', 'eat', 'طعام', 'مطبخ', 'وصفات', 'أطباق', 'أكل']
  },
  GEOGRAPHY: {
    id: 'geography',
    arabic: 'الجغرافيا والأماكن',
    english: 'Geography & Places',
    keywords: ['geography', 'places', 'cities', 'locations', 'map', 'جغرافيا', 'أماكن', 'مدن', 'مواقع', 'خريطة']
  },
  ART_MUSIC: {
    id: 'art_music',
    arabic: 'الفن والموسيقى',
    english: 'Art & Music',
    keywords: ['art', 'music', 'artists', 'musicians', 'songs', 'paintings', 'embroidery', 'tatreez', 'فن', 'فنون', 'موسيقى', 'فنانين', 'موسيقيين', 'أغاني', 'لوحات', 'تطريز']
  },
  DAILY_LIFE: {
    id: 'daily_life',
    arabic: 'الحياة اليومية',
    english: 'Daily Life',
    keywords: ['daily life', 'everyday', 'routine', 'living', 'حياة يومية', 'يومي', 'روتين', 'معيشة']
  },
  NAKBA: {
    id: 'nakba',
    arabic: 'النكبة',
    english: 'Nakba',
    keywords: ['nakba', 'catastrophe', '1948', 'displacement', 'refugees', 'نكبة', 'كارثة', '١٩٤٨', 'تهجير', 'لاجئين']
  },
  FIGURES: {
    id: 'figures',
    arabic: 'شخصيات بارزة',
    english: 'Notable Figures',
    keywords: ['figures', 'people', 'personalities', 'leaders', 'poets', 'artists', 'شخصيات', 'أشخاص', 'قادة', 'شعراء', 'فنانين']
  },
  LANGUAGE: {
    id: 'language',
    arabic: 'اللغة والشعر',
    english: 'Language & Poetry',
    keywords: ['language', 'poetry', 'arabic', 'proverbs', 'لغة', 'شعر', 'عربي', 'أمثال']
  },
  // Add more topics as needed based on your data files
};

// Helper function to get topic info by ID
export const getTopicById = (id: string): TopicInfo | undefined => {
  return Object.values(TOPICS).find(topic => topic.id === id);
};

// Helper function to find topic by keyword
export const findTopicByKeyword = (text: string): TopicInfo | undefined => {
    const lowerText = text.toLowerCase();
    for (const topic of Object.values(TOPICS)) {
        if (topic.keywords.some(kw => lowerText.includes(kw))) {
            return topic;
        }
    }
    return undefined;
};