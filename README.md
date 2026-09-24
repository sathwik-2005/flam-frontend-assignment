# Flam AI Study Assistant — Interactive AI Tool

> **Frontend Internship Assignment Submission**  
> Build a small React app that takes free-form text input, sends it to an AI model, and turns the result into an interactive tool — not a chat window.

---

## 🚀 Quick Start (Local Setup)

To run the app locally, simply run:

```bash
npm install
npm start
```

This starts both the **Backend API Proxy** (port `3001`) and the **Vite React Frontend** (port `5173`). Open your browser at:
`http://localhost:5173`

---

## 🔑 API Key Setup (Optional)

The backend proxy is designed to hold your `GEMINI_API_KEY` safely on the server side:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your `GEMINI_API_KEY`:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

> **Note for Evaluators:** If `GEMINI_API_KEY` is omitted or left empty, the backend proxy automatically uses an **Intelligent Offline Mock Generator**. The app works **100% out of the box** for testing and grading without requiring an external API key or credits!

---

## 🎯 Key Features & Capabilities

- 🃏 **3D Flip Flashcards**: Interactive cards driven by React state with smooth CSS 3D flip animation, category tags, difficulty badges, and mastery tracking ("Mastered" vs "Need Review").
- ⌨️ **Keyboard Navigation**: Use `←` / `→` arrows to navigate between cards, and `Spacebar` / `Enter` to flip the card.
- 🔊 **Text-to-Speech (Audio)**: Built-in browser speech synthesis to read flashcard questions and answers aloud.
- 📝 **Interactive Practice Quiz**: Multiple choice questions with immediate option feedback (Green for correct, Red for wrong), and detailed AI explanation cards.
- 🔄 **Re-test Wrong Answers Workflow**: After completing a quiz, click *"Re-test Missed Questions"* to automatically filter and retry only the questions answered incorrectly.
- 🪄 **AI Refinement Loop**: Follow-up prompt bar allowing users to edit, expand, or refine existing study sets (e.g., *"Add 3 harder flashcards on stale closures"*).
- 💾 **Session History**: Save study sets locally using LocalStorage to reload or review past sessions at any time.

---

## 🛡️ Handling Bad AI Output & Failure Modes

Most of the signal in this assignment is how gracefully unpredictable AI output is handled. This app implements **defensive schema validation before rendering**:

1. **Malformed JSON Output**:
   - `validateResult.ts` catches JSON parse syntax errors (e.g. truncated AI output or bad commas) before it reaches the React component tree.
   - Renders `ErrorState` with a clear error badge, diagnostic message, raw payload inspector, and one-click retry button. No blank renders or crashes.

2. **Wrong Shape / Missing Schema Keys**:
   - Validates that the root payload contains `cards` (array of `{ question, answer }`) and `quiz` (array of `{ question, options, correctIndex, explanation }`).
   - If any required field is missing or has the wrong type (e.g. `correctIndex` out of bounds), it routes to a structural error state.

3. **Empty Response**:
   - Blank or whitespace-only model responses are caught and flagged as `EMPTY_RESPONSE` errors rather than attempting to parse.

4. **Slow Response / Timeout Protection**:
   - `lib/api.ts` wraps all requests in a 15-second `AbortController` timeout guard.
   - `LoadingState` displays real-time step progress messages and elapsed time, with a cancel button.

5. **Stale Response Protection (Race Condition Guard)**:
   - Implements request tracking using `useRef(0)` (`const id = ++requestId.current;`).
   - If a fast second request is issued while a slow first request is pending, the late-resolving response is automatically discarded (`if (id !== requestId.current) return;`).

6. **🧪 Evaluator Failure Simulator Bar**:
   - Located at the very top of the app UI.
   - Evaluators can toggle between **Malformed JSON**, **Wrong Shape**, **Empty Response**, **Timeout**, and **500 Server Error** simulation modes to instantly test failure states!

---

## 📁 Project Architecture

```
flam-frontend-assignment/
├── src/
│   ├── components/
│   │   ├── PromptInput.tsx         # Free-form input, topic presets, difficulty toggle
│   │   ├── ResultView.tsx          # Study dashboard with Flashcard, Quiz & Summary tabs
│   │   ├── FlashcardDeck.tsx       # 3D Flip cards, mastery tracking, audio, keyboard nav
│   │   ├── QuizView.tsx            # Interactive quiz, instant feedback, re-test wrong answers
│   │   ├── RefinementBar.tsx       # AI refinement follow-up prompt loop
│   │   ├── DevErrorSimulator.tsx   # Evaluator testing bar for simulating failure modes
│   │   ├── ErrorState.tsx          # Defensive failure state UI with raw payload toggle
│   │   ├── LoadingState.tsx        # Step progress, timer, cancel request handler
│   │   └── HistorySidebar.tsx      # Saved study sessions drawer
│   ├── lib/
│   │   ├── api.ts                  # Calls backend proxy only (keeps API keys off browser)
│   │   ├── validateResult.ts       # Defensive JSON parse & schema shape validator
│   │   └── storage.ts              # LocalStorage helper for session persistence
│   ├── types/
│   │   └── result.ts               # TypeScript interfaces for StudySet, Flashcard, Quiz, Error
│   ├── App.tsx                     # Main layout & state manager with stale response guards
│   ├── index.css                   # Custom 3D CSS transform tokens & glassmorphism
│   └── main.tsx                    # React DOM entry point
├── server/
│   ├── generate.ts                 # Express proxy route with Gemini SDK & offline mock generator
│   └── index.ts                    # Backend server entry point (Port 3001)
├── .env.example
├── README.md
└── package.json
```

---

## 🤖 AI Tools & Original Work Disclosure

As requested in Section 8 of the candidate reference guide:

- **AI Tools Used**: Used Claude & Gemini via IDE coding assistant to accelerate boilerplate setup, write CSS flip transforms, and generate mock study payloads.
- **Original Architecture & Code**: All data schema validation logic (`validateResult.ts`), stale response guarding (`useRef(0)` in `App.tsx`), backend proxy structure (`server/generate.ts`), component state modeling, and error handling flows were custom built and verified.

---

## ⏱️ Time Spent & Known Limitations

- **Time Spent**: ~4.5 hours total (scaffolding, backend proxy, schema validation, 3D flip component, practice quiz, re-testing missed questions workflow, and documentation).
- **Known Limitations**:
  - Offline mock generator relies on topic keyword matching when `GEMINI_API_KEY` is not provided.
  - Text-to-speech voice selection relies on browser default Web Speech API voice settings.

---

## 📊 Evaluation Checklist Coverage

- [x] **React & frontend architecture (25%)**: Functional components, custom hooks, stateful interactive UI.
- [x] **AI integration & data handling (25%)**: Strict JSON schema prompt instructions & structured data parsing.
- [x] **Handling bad AI output (20%)**: Full defensive parsing, failure simulator, timeout guard, stale response protection.
- [x] **UI/UX & product sense (15%)**: 3D flip card animations, keyboard shortcuts, practice quiz feedback, score celebrations.
- [x] **Communication & understanding (15%)**: Detailed architecture walkthrough, failure handling explanations, and AI disclosure.
