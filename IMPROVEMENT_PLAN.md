# Abu Khalil Chatbot Improvement Plan: Hybrid Approach (Local Data Guided API)

**Goal:** Enhance the Abu Khalil chatbot to generate responses using the Google Gemini API, but guide the API with relevant local data (persona definitions and structured knowledge facts) to ensure consistency, authenticity, and grounding in the Abu Khalil persona, while maintaining conversational dynamism. This approach should support both Arabic and English.

## Plan Details:

1.  **Data Loading & Preparation:**
    *   Implement a mechanism (e.g., a utility function) to read all `.json` files from the `src/data/knowledge/` directory. This could happen at application startup or be triggered on demand.
    *   Aggregate the content of these JSON files into a single, efficiently searchable data structure (e.g., an array or map of knowledge objects).
    *   Parse the `public/abu-khalil-persona.md` file. Specifically extract the `persona_lens_ref` sections (lines matching the pattern `*   ``..._lens``:`) into a key-value map for easy lookup (e.g., `{'nakba_lens': 'The Nakba... 1948. The Catastrophe...'}`).

2.  **Context Identification:**
    *   Develop a function to process the incoming user message. This involves:
        *   Normalizing the text (e.g., lowercasing, potentially removing common stop words).
        *   Comparing the normalized message keywords against the `keywords` array within each loaded knowledge object.
    *   Implement a scoring or matching algorithm to identify the best matching knowledge object(s) based on keyword relevance or overlap.
    *   From the best match(es), identify the corresponding `persona_lens_ref` key(s).

3.  **Prompt Engineering for Gemini:**
    *   Create a function to dynamically construct a detailed prompt for the Gemini API based on the identified context.
    *   **If context is found:**
        *   Retrieve the relevant fact(s) (`arabic_fact` or `english_fact` based on the requested language) from the matched knowledge object(s).
        *   Retrieve the corresponding persona lens text(s) from the prepared persona map using the `persona_lens_ref` key(s).
        *   Construct the prompt, clearly instructing Gemini to:
            *   Act as Abu Khalil.
            *   Use the provided persona lens text(s) for tone, style, and perspective (e.g., "Adopt this specific viewpoint: [persona text]").
            *   Base the factual part of the answer on the provided fact(s) (e.g., "Incorporate this information: [fact text]").
            *   Respond naturally and conversationally, synthesizing the persona and facts.
            *   Use the specified output language (Arabic/English).
            *   Include the original user query for context.
    *   **If no specific context is found:**
        *   Construct a default prompt instructing Gemini to respond as Abu Khalil based on his general persona description (potentially including the core persona details from the markdown file) and the user's query.

4.  **Modified `sendMessage` Logic (in `src/services/chatService.ts`):**
    *   Refactor the `sendMessage` function:
        *   Call the Context Identification function (Step 2) with the user's message.
        *   Call the Prompt Engineering function (Step 3) to generate the augmented prompt based on the identified context (or lack thereof).
        *   Modify the call to `getGeminiResponse` (likely in `src/services/geminiService.ts`) to accept and use this detailed, augmented prompt instead of just the raw user message. Ensure the service can handle potentially longer/more complex prompts.
        *   Return the response received from the Gemini API.

## Visual Representation (Mermaid Diagram):

```mermaid
graph LR
    A[User Message + Language] --> B(Identify Relevant Knowledge & Persona Lens);
    B -- Context Found --> C(Retrieve Fact(s) & Persona Text);
    B -- No Context Found --> D(Prepare Default Persona Prompt);
    C --> E(Construct Augmented Prompt for Gemini);
    D --> E;
    E --> F(Call Gemini API with Augmented Prompt);
    F --> G[Chatbot Response (Gemini, informed by Local Data)];
```

## Key Outcome:

The chatbot will leverage the Gemini API for dynamic response generation but will be consistently guided by the local knowledge base and persona definitions, resulting in more authentic, accurate, and contextually relevant interactions in both Arabic and English.