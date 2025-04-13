
import { v4 as uuidv4 } from 'uuid';
import { getGeminiResponse } from './geminiService';
import {
  findBestKnowledgeMatch,
  buildGeminiPrompt,
  knowledgeEntries,
  personaLenses,
} from './knowledgeService';
import { findTopicByKeyword, getTopicById, TopicInfo } from '../data/topics';
import { recipes } from './knowledgeService'; // Import recipes data
import type { QuizQuestion } from '../data/palestinianData';
import { getRandomQuiz, getQuizByTopic } from './quizService'; // Import quiz functions

export interface ChatResponse {
  id: string;
  text: string;
  isKhetyar: boolean;
  quizData?: QuizQuestion; // Keep quizData for passing to UI
  detectedTopicId?: string | null; // Add field to signal topic change
}

// Define Message type locally to avoid potential circular dependency with Index.tsx
interface Message {
  id: string;
  text: string;
  isKhetyar: boolean;
}

// More personalized responses that sound like they're coming from an elderly Palestinian person
const englishResponses = {
  greeting: "As-salamu alaykum, my child. My name is Abu Khalil. I've lived through many seasons in our beautiful Palestine. What would you like to know?",
  
  personal: [
    "I was born in a small village near Jaffa, before the Nakba of 1948. My family had olive groves that stretched as far as the eye could see. Now I live in Ramallah, but my heart remains in my birthplace.",
    
    "When I was young like you, I helped my father with the olive harvest every autumn. We would spread tarps under the trees and gently shake the branches. My mother would prepare zeit wa za'atar for us to dip our bread. Simple pleasures that I still cherish.",
    
    "My grandchildren always ask me for stories. I tell them about the land, about our resilience, about hope. What else can we give to the next generation if not hope?",
    
    "At my age, I've seen many changes. Some days are hard, watching the walls go up, the checkpoints multiply. But I've also seen incredible solidarity and kindness from people around the world. This gives me strength."
  ],
  
  daily: [
    "My day? I wake before fajr prayer, make my coffee with cardamom - the proper way, not this instant nonsense the young people drink! Then I tend to my small garden where I grow mint, sage, and tomatoes. Later, I might visit the local café to play backgammon with my old friends.",
    
    "These days, I spend a lot of time with my grandchildren. I teach them our old songs, our proverbs. The youngest one, Layla, already knows how to make proper taboon bread! Seven years old and already has the magic in her hands.",
    
    "Living under occupation means you learn to navigate many obstacles. Today I waited three hours at a checkpoint just to visit my sister in the next town. But we Palestinians have a saying: 'Patience is the key to relief'. So we wait, and we endure."
  ],
  
  culture: [
    "Our Palestinian embroidery - tatreez - tells our story through thread and needle. Each pattern has meaning. The cypress tree represents immortality; the birds, freedom. My late wife's wedding dress had patterns specific to our village. I keep it still.",
    
    "For us, food is not just nourishment - it's our identity, our resistance, our love. When my mother made maqlouba, she would flip the pot with such ceremony! And the smell of za'atar mixed with olive oil from our own trees... there is nothing like it in the world.",
    
    "In Palestine, we say 'dar dar' - from home to home. It means to visit one another, to maintain community. Even in the hardest times, we keep these connections. We bring sweets when a baby is born, we mourn together, we celebrate together."
  ],
  
  misc: [
    "Hmm, that's an interesting question. At my age, I've learned that wisdom often means knowing when to listen more than speak. Perhaps you could tell me more about what you're curious about?",
    
    "You know, that reminds me of something my father used to say: 'The one who lives longer sees more.' I've lived through many chapters of our Palestinian story. Each day brings new challenges, but also new possibilities.",
    
    "I may be an old man now, but I still believe in the power of small acts. Planting an olive tree, teaching a child our stories, preserving our traditions - these are my forms of resistance and hope."
  ]
};

const arabicResponses = {
  greeting: "السلام عليكم يا بني. اسمي أبو خليل. عشت عبر مواسم عديدة في فلسطين الجميلة. ماذا تود أن تعرف؟",
  
  personal: [
    "ولدت في قرية صغيرة بالقرب من يافا، قبل نكبة 1948. كان لعائلتي بساتين زيتون تمتد على مد البصر. الآن أعيش في رام الله، لكن قلبي لا يزال في مسقط رأسي.",
    
    "عندما كنت صغيراً مثلك، كنت أساعد والدي في موسم قطف الزيتون كل خريف. كنا نفرش الحصائر تحت الأشجار ونهز الأغصان بلطف. كانت أمي تحضر لنا زيت وزعتر لنغمس خبزنا فيه. ملذات بسيطة ما زلت أعتز بها.",
    
    "أحفادي يطلبون مني دائماً القصص. أخبرهم عن الأرض، عن صمودنا، عن الأمل. ماذا يمكننا أن نعطي للجيل القادم إن لم يكن الأمل؟",
    
    "في سني، رأيت الكثير من التغييرات. بعض الأيام صعبة، أشاهد الجدران ترتفع، والحواجز تتكاثر. لكنني شهدت أيضاً تضامناً وعطفاً لا يصدق من الناس حول العالم. هذا يمنحني القوة."
  ],
  
  daily: [
    "يومي؟ أستيقظ قبل صلاة الفجر، أصنع قهوتي بالهيل - بالطريقة الصحيحة، وليس هذه الفورية التي يشربها الشباب! ثم أعتني بحديقتي الصغيرة حيث أزرع النعناع والميرمية والطماطم. لاحقاً، قد أزور المقهى المحلي لألعب الطاولة مع أصدقائي القدامى.",
    
    "هذه الأيام، أقضي الكثير من الوقت مع أحفادي. أعلمهم أغانينا القديمة وأمثالنا. الصغيرة، ليلى، تعرف بالفعل كيف تصنع خبز الطابون الصحيح! سبع سنوات فقط ولديها بالفعل السحر في يديها.",
    
    "العيش تحت الاحتلال يعني أنك تتعلم التنقل عبر العديد من العقبات. اليوم انتظرت ثلاث ساعات عند حاجز لمجرد زيارة أختي في البلدة المجاورة. لكن لدينا نحن الفلسطينيين مثل يقول: 'الصبر مفتاح الفرج'. لذا ننتظر ونصمد."
  ],
  
  culture: [
    "تطريزنا الفلسطيني يروي قصتنا من خلال الخيط والإبرة. كل نمط له معنى. شجرة السرو ترمز للخلود؛ والطيور للحرية. فستان زفاف زوجتي الراحلة كان يحمل أنماطاً خاصة بقريتنا. ما زلت أحتفظ به.",
    
    "بالنسبة لنا، الطعام ليس مجرد غذاء - إنه هويتنا، مقاومتنا، حبنا. عندما كانت أمي تصنع المقلوبة، كانت تقلب القدر بمراسم خاصة! ورائحة الزعتر ممزوجة بزيت الزيتون من أشجارنا... ليس هناك مثيل لها في العالم.",
    
    "في فلسطين، نقول 'دار دار' - من بيت إلى بيت. هذا يعني زيارة بعضنا البعض، للحفاظ على المجتمع. حتى في أصعب الأوقات، نحافظ على هذه الروابط. نحضر الحلويات عندما يولد طفل، نحزن معًا، نحتفل معًا."
  ],
  
  misc: [
    "همم، هذا سؤال مثير للاهتمام. في سني، تعلمت أن الحكمة غالباً ما تعني معرفة متى تستمع أكثر مما تتكلم. ربما يمكنك إخباري المزيد عما تشعر بالفضول حوله؟",
    
    "تعلم، هذا يذكرني بشيء كان أبي يقوله: 'من عاش أكثر رأى أكثر.' لقد عشت عبر العديد من فصول قصتنا الفلسطينية. كل يوم يجلب تحديات جديدة، ولكن أيضًا إمكانيات جديدة.",
    
    "قد أكون رجلاً عجوزًا الآن، لكنني ما زلت أؤمن بقوة الأفعال الصغيرة. زراعة شجرة زيتون، تعليم طفل قصصنا، الحفاظ على تقاليدنا - هذه هي أشكال مقاومتي وأملي."
  ]
};

// Enhanced topic detection
const getTopicFromMessage = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Personal questions
  if (lowerMessage.includes('who are you') || 
      lowerMessage.includes('your name') || 
      lowerMessage.includes('introduce yourself') ||
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi ') ||
      lowerMessage.includes('hey')) {
    return 'greeting';
  }
  
  // Personal history/experience
  if (lowerMessage.includes('where') || 
      lowerMessage.includes('born') || 
      lowerMessage.includes('family') || 
      lowerMessage.includes('your life') ||
      lowerMessage.includes('childhood') ||
      lowerMessage.includes('remember') ||
      lowerMessage.includes('your story')) {
    return 'personal';
  }
  
  // Daily life questions
  if (lowerMessage.includes('day') || 
      lowerMessage.includes('daily') || 
      lowerMessage.includes('routine') ||
      lowerMessage.includes('today') ||
      lowerMessage.includes('how do you') ||
      lowerMessage.includes('what do you do')) {
    return 'daily';
  }
  
  // Cultural questions
  if (lowerMessage.includes('food') || 
      lowerMessage.includes('tradition') || 
      lowerMessage.includes('culture') || 
      lowerMessage.includes('embroidery') ||
      lowerMessage.includes('tatreez') ||
      lowerMessage.includes('dance') ||
      lowerMessage.includes('music') ||
      lowerMessage.includes('song') ||
      lowerMessage.includes('wedding') ||
      lowerMessage.includes('celebration') ||
      lowerMessage.includes('custom')) {
    return 'culture';
  }
  
  // Fall back to misc/conversational
  return 'misc';
};

// Get more human-like, contextual responses
const getResponseForTopic = (topic: string, language: "arabic" | "english"): string => {
  const responses = language === "arabic" ? arabicResponses : englishResponses;
  
  if (topic === 'greeting') {
    return responses.greeting;
  }
  
  const topicResponses = responses[topic as keyof typeof responses];
  if (Array.isArray(topicResponses) && topicResponses.length > 0) {
    // Pick a random response from the appropriate category
    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  }
  
  // Fallback to misc category
  return responses.misc[Math.floor(Math.random() * responses.misc.length)];
};

// Update return type to potentially include detected topic
export const sendMessage = async (
  message: string,
  language: "arabic" | "english",
  history: Message[] = [],
  currentTopicId: string | null // Receive current topic
): Promise<ChatResponse> => { // Return type remains ChatResponse, but might include detectedTopicId
  // Simulate API call delay - variable response time makes it feel more human
  await delay(500 + Math.random() * 800);

  // --- Command Handling ---
  const lowerMessage = message.toLowerCase();

  // 1. Check for Recipe Command
  const recipeKeywords = ['recipe', 'make', 'how to', 'cook', 'وصفة', 'طريقة عمل', 'كيف أعمل', 'اطبخ'];
  const isRecipeRequest = recipeKeywords.some(kw => lowerMessage.includes(kw));

  if (isRecipeRequest) {
    // Find matching recipe (simple keyword check for now)
    const foundRecipe = recipes.find(recipe =>
      recipe.keywords.some(kw => lowerMessage.includes(kw.toLowerCase()))
    );

    if (foundRecipe) {
      // Format the recipe using markdown
      const name = language === 'arabic' ? foundRecipe.name_arabic : foundRecipe.name_english;
      const description = language === 'arabic' ? foundRecipe.description_arabic : foundRecipe.description_english;
      const ingredientsTitle = language === 'arabic' ? '**المكونات:**' : '**Ingredients:**';
      const instructionsTitle = language === 'arabic' ? '**الطريقة:**' : '**Instructions:**';

      const ingredientsList = foundRecipe.ingredients.map(ing =>
        `- ${language === 'arabic' ? ing.amount_arabic : ing.amount_english} ${language === 'arabic' ? ing.item_arabic : ing.item_english}`
      ).join('\n');

      // Select the correct instructions array based on language
      const instructions = language === 'arabic' ? foundRecipe.instructions_arabic : foundRecipe.instructions_english;
      const instructionsList = instructions.map((step, index) =>
        `${index + 1}. ${step}` // Steps are already in the correct language
      ).join('\n');

      const recipeText = `**${name}**\n\n${description}\n\n${ingredientsTitle}\n${ingredientsList}\n\n${instructionsTitle}\n${instructionsList}`;

      return {
        id: uuidv4(),
        text: recipeText,
        isKhetyar: true,
        detectedTopicId: null // Not a topic change command
      };
    }
    // If recipe requested but not found, could fall through to Gemini or return specific message
  }

  // --- Continue with other command checks (Quiz, Topic) ---
  // const lowerMessage = message.toLowerCase(); // Remove duplicate declaration

  // 1. Check for Quiz Command
  const quizKeywords = ['quiz', 'test', 'question', 'ask me', 'اختبار', 'سؤال', 'اسألني'];
  const isQuizRequest = quizKeywords.some(kw => lowerMessage.includes(kw));

  if (isQuizRequest) {
    const requestedTopic = findTopicByKeyword(message); // Check if a topic is mentioned
    let selectedQuiz: QuizQuestion | null = null;

    if (requestedTopic) {
      selectedQuiz = getQuizByTopic(requestedTopic.id);
      console.log(`Quiz requested for topic: ${requestedTopic.id}. Found: ${!!selectedQuiz}`); // Debug log
    } else {
      selectedQuiz = getRandomQuiz();
      console.log(`General quiz requested. Found: ${!!selectedQuiz}`); // Debug log
    }

    if (selectedQuiz) {
      // Format the question text for display
      let formattedQuestion = selectedQuiz.question[language] + "\n\n";
      selectedQuiz.options.forEach((option, index) => {
        formattedQuestion += `${index + 1}. ${option[language]}\n`;
      });
      formattedQuestion += language === 'arabic' ? "\nاختر الإجابة الصحيحة (أرسل الرقم فقط)." : "\nChoose the correct answer (send the number only).";

      return {
        id: uuidv4(),
        text: formattedQuestion,
        isKhetyar: true,
        quizData: selectedQuiz, // Attach the full quiz data
        detectedTopicId: null // Not a topic change command
      };
    } else {
      // Handle case where no quizzes are available
      const topicName = requestedTopic ? (language === 'arabic' ? requestedTopic.arabic : requestedTopic.english) : null;
      const noQuizText = language === 'arabic'
        ? (topicName ? `عذراً، ليس لدي أسئلة اختبار حول ${topicName} الآن.` : "عذراً، ليس لدي أي أسئلة اختبار جاهزة الآن يا بني.")
        : (topicName ? `Sorry, I don't have any quiz questions about ${topicName} right now.` : "Sorry, I don't have any quiz questions ready right now, my child.");
      return {
        id: uuidv4(),
        text: noQuizText,
        isKhetyar: true,
        detectedTopicId: null
      };
    }
  }

  // 2. Check for Topic Command (if not a quiz request)
  const detectedTopic = findTopicByKeyword(message);
  // Ensure it's not just picking up keywords from a general question
  const topicCommandKeywords = ['topic', 'subject', 'about', 'discuss', 'talk about', 'focus on', 'موضوع', 'حول', 'عن', 'ناقش', 'تحدث'];
  const isTopicCommand = topicCommandKeywords.some(kw => lowerMessage.startsWith(kw) || lowerMessage.includes(` ${kw} `));

  if (detectedTopic && isTopicCommand && detectedTopic.id !== currentTopicId) {
    const topicName = language === 'arabic' ? detectedTopic.arabic : detectedTopic.english;
    const confirmationText = language === 'arabic'
      ? `حسناً، لنتحدث عن ${topicName}. ماذا تود أن تعرف؟`
      : `Okay, let's focus on ${topicName}. What would you like to know?`;
    return {
      id: uuidv4(),
      text: confirmationText,
      isKhetyar: true,
      detectedTopicId: detectedTopic.id // Signal topic change to UI
    };
  }

  // 3. If no specific command detected, proceed with knowledge search & Gemini call
  try {
    // Pass currentTopicId to knowledge matching and prompt building
    const { entry: bestEntry } = findBestKnowledgeMatch(message, knowledgeEntries, currentTopicId);
    const customPrompt = buildGeminiPrompt(
      message,
      language,
      bestEntry,
      personaLenses,
      currentTopicId // Pass topic to prompt generator
    );

    // Always use Gemini, but with local context if available
    // Pass currentTopicId to potentially filter quiz selection if applicable later
    const geminiResponse = await getGeminiResponse(message, language, history, customPrompt);

    // Return Gemini response (without changing topic)
    return { ...geminiResponse, detectedTopicId: null };
  } catch (error) {
    console.error("Error with Gemini API, falling back to predefined responses:", error);

    // Fallback to predefined responses if Gemini fails
    const topic = getTopicFromMessage(message);
    const responseText = getResponseForTopic(topic, language);

    return {
      id: uuidv4(),
      text: responseText,
      isKhetyar: true
    };
  }
};

// Simulate API call delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
