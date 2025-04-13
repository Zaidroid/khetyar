# Chatbot Restructuring Plan: Abu Khalil Persona &amp; Hybrid Knowledge Base

## 1. Goal

Restructure the chatbot application to:
*   Consistently embody the detailed **Abu Khalil persona**.
*   Draw knowledge primarily from a **local, expanded dataset**.
*   Remove dependency on external AI services (like Gemini) for core responses.

## 2. Knowledge Base Strategy (Hybrid Approach)

The chatbot's knowledge will be sourced from two local components:

*   **Core Persona &amp; Voice (`public/abu-khalil-persona.md`):**
    *   Defines Abu Khalil's personality, voice, tone, greetings, common phrases, and specific "Lens" perspectives (how he personally frames certain topics).
    *   Section I ("Detailed Persona") guides response formatting.
    *   Section II ("Lens" parts) provides specific phrasing for certain topics when available.
*   **Supplemental Factual Data (`src/data/knowledge/` - New Directory):**
    *   Contains multiple structured JSON files organized by topic (e.g., `history.json`, `culture.json`, `geography.json`, `nakba_details.json`, `proverbs_expanded.json`).
    *   **JSON Structure Example:**
        ```json
        {
          "id": "hist001",
          "topic": "History",
          "subtopic": "Nakba",
          "keywords": ["nakba", "1948", "catastrophe", "refugees"],
          "arabic_fact": "...",
          "english_fact": "...",
          "persona_lens_ref": "nakba_lens" // Optional ID linking to MD section
        }
        ```
    *   Provides detailed, verifiable information supplementing the persona file.

## 3. Phase 1: Knowledge Base Population (Manual Effort Required)

*   **Define JSON Structure:** Finalize the schema for the knowledge JSON files.
*   **Define Topics:** Identify the key topics and subtopics to cover (History, Culture, Geography, Daily Life, Key Events, Figures, etc.).
*   **Curate Content:** Research, write, and structure the factual information into the defined JSON files within `src/data/knowledge/`. This is a significant content creation task.
*   **Refine Persona MD:** Review `abu-khalil-persona.md` to ensure clear separation of persona rules (Section I) and identifiable "Lens" sections (Section II) that can be referenced from the JSON data.

## 4. Phase 2: Implementation

*   **Create `src/services/knowledgeService.ts`:**
    *   Loads and parses `abu-khalil-persona.md` (for persona rules/lens).
    *   Loads and parses all JSON files from `src/data/knowledge/`.
    *   Provides a unified interface to query the combined knowledge base (search by keywords, retrieve facts, get persona elements).
*   **Refactor `src/services/chatService.ts`:**
    *   **Remove External Dependency:** Eliminate calls to `geminiService.ts`.
    *   **Intent Detection:** Implement logic to analyze user input, identify keywords/topics, and map them to queries for the `knowledgeService`.
    *   **Knowledge Retrieval:** Query `knowledgeService` to fetch relevant factual data (from JSON) and any specific persona "Lens" (from MD).
    *   **Response Formatting:** Create a dedicated `ResponseFormatter` (function or class):
        *   Takes retrieved data (facts, lens).
        *   Applies Abu Khalil persona rules (greetings, tone, Arabic terms, storytelling style) from the MD file.
        *   Prioritizes specific "Lens" phrasing when available.
        *   Generates the final text response.
    *   **Fallback:** Implement persona-consistent fallback responses for unmatched queries, using general persona rules.
*   **Isolate `src/data/palestinianData.ts`:** Retain primarily for the `quizzes` feature. Avoid using its `proverbs` or `culturalFacts` for core chat logic, relying instead on the new knowledge base.

## 5. Conceptual Diagram

```mermaid
graph LR
    subgraph Knowledge Acquisition (Phase 1)
        KA[Define JSON Structure &amp; Topics];
        KB[Populate JSON files in src/data/knowledge/];
        KC[Refine abu-khalil-persona.md for Core Persona/Lens];
        KA --> KB;
        KC --> KD[Persona Rules &amp; Lens (MD)];
        KB --> KE[Structured Factual Data (JSON)];
    end

    subgraph Chatbot Implementation (Phase 2)
        A[User Input] --> B(sendMessage in chatService.ts);
        B -- Extracts Keywords/Intent --> C{Intent Detector};

        subgraph Knowledge Layer
            D(knowledgeService.ts);
            D -- Loads --> KD;
            D -- Loads --> KE;
            D -- Provides Query Interface --> F;
        end

        subgraph Response Generation
            F[Query Knowledge Service];
            G{Response Formatter};
            G -- Uses Persona Rules (KD) --> H;
            F -- Returns Data (JSON/MD Lens) --> G;
        end

        C -- Query Intent --> F;
        H --> J[Chatbot Response];
        C -- No Match --> K{Fallback Logic};
        K -- Uses General Persona (KD) --> G;
    end

    style KD fill:#ccf,stroke:#333,stroke-width:1px
    style KE fill:#f9f,stroke:#333,stroke-width:2px
```

## 6. Next Steps

1.  Begin Phase 1: Populate the knowledge base (JSON files and MD refinement).
2.  Proceed to Phase 2: Implement the code changes (`knowledgeService`, `chatService` refactor, `ResponseFormatter`).