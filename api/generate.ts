import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are a world-class AI Study & Learning Assistant.
Your task is to analyze the user's input topic, notes, or concept and generate structured study material.

CRITICAL INSTRUCTIONS:
1. You MUST return ONLY valid JSON matching the exact schema below.
2. DO NOT include any markdown block quotes, preamble, or extra text outside the JSON object.
3. Every flashcard must have a clear, concise question and a thorough, accurate answer.
4. Every quiz question must have 4 distinct multiple-choice options, 0-indexed correctIndex, and a clear explanation.

JSON SCHEMA EXPECTED:
{
  "topic": "Concise Topic Name",
  "summary": {
    "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
    "prerequisites": ["Prereq 1", "Prereq 2"],
    "estimatedStudyTimeMinutes": 15
  },
  "cards": [
    {
      "id": "card-1",
      "question": "What is ...?",
      "answer": "Explanation of ...",
      "category": "Core Concept",
      "difficulty": "medium"
    }
  ],
  "quiz": [
    {
      "id": "quiz-1",
      "question": "Which of the following is true regarding ...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why Option A is correct..."
    }
  ]
}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, difficulty = 'intermediate', refinement, existingSet, simulateError = 'none' } = req.body;

    if (!prompt && !refinement) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'FAILED_REQUEST',
          title: 'Missing Input',
          message: 'Please provide a topic or notes to generate study cards.',
          timestamp: new Date().toLocaleTimeString(),
        },
      });
    }

    if (simulateError === 'slow') {
      await new Promise((resolve) => setTimeout(resolve, 16000));
    }
    if (simulateError === 'failed') {
      return res.status(500).json({
        success: false,
        error: {
          type: 'FAILED_REQUEST',
          title: 'Simulated 500 Server Error',
          message: 'The AI model server experienced an internal 500 error.',
          timestamp: new Date().toLocaleTimeString(),
        },
      });
    }
    if (simulateError === 'empty') {
      return res.json({ success: true, rawJson: '   ' });
    }
    if (simulateError === 'malformed') {
      return res.json({
        success: true,
        rawJson: '{\n  "topic": "Broken Study Set",\n  "cards": [\n    {"question": "What is X?", "answer": "Y",\n  ] // TRUNCATED BAD SYNTAX',
      });
    }
    if (simulateError === 'wrong_shape') {
      return res.json({
        success: true,
        rawJson: JSON.stringify({
          topic: "Invalid Shape",
          randomText: "This response lacks cards array and quiz array!",
          cards: "Not an array, just a string",
        }),
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || (req.headers['x-gemini-api-key'] as string);

    if (apiKey && apiKey.trim().length > 5) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      let fullUserPrompt = `Generate a ${difficulty}-level study set for the topic: "${prompt}". Generate at least 5 flashcards and 4 quiz questions.`;

      if (refinement && existingSet) {
        fullUserPrompt = `Refine this existing study set titled "${existingSet.topic}".
User refinement instructions: "${refinement}".
Current cards count: ${existingSet.cards.length}.
Please return the updated full study set JSON structure matching the required schema.`;
      }

      const result = await model.generateContent([SYSTEM_PROMPT, fullUserPrompt]);
      const rawText = result.response.text();

      return res.json({
        success: true,
        rawJson: rawText,
      });
    }

    console.log('[API] GEMINI_API_KEY not set. Using fallback mock study generator.');
    const mockJson = generateMockStudySet(prompt || existingSet?.topic || 'General Topic', difficulty, refinement);

    await new Promise((resolve) => setTimeout(resolve, 800));

    return res.json({
      success: true,
      rawJson: JSON.stringify(mockJson, null, 2),
    });
  } catch (err: any) {
    console.error('[API Error]:', err);
    return res.status(500).json({
      success: false,
      error: {
        type: 'FAILED_REQUEST',
        title: 'LLM Proxy Error',
        message: err?.message || 'An error occurred while communicating with the LLM backend.',
        timestamp: new Date().toLocaleTimeString(),
      },
    });
  }
}

function generateMockStudySet(inputTopic: string, difficulty: string, refinement?: string) {
  const cleanTopic = inputTopic.trim();
  const lower = cleanTopic.toLowerCase();

  let isReact = lower.includes('react') || lower.includes('hook') || lower.includes('state');

  let cards: any[] = [
    { id: 'card-1', question: `What is the fundamental core principle of ${cleanTopic}?`, answer: `${cleanTopic} focuses on building structured, reliable modular concepts by decomposing complex problems into manageable sub-components.`, category: 'Fundamentals', difficulty: 'easy' },
    { id: 'card-2', question: `How does ${cleanTopic} handle state transitions or changes over time?`, answer: `State transitions are managed through deterministic function updates or state hooks, ensuring predictable updates and avoiding unexpected side effects.`, category: 'Architecture', difficulty: 'medium' },
    { id: 'card-3', question: `What common failure mode occurs in ${cleanTopic}, and how is it mitigated?`, answer: `Race conditions and unvalidated external inputs are common pitfalls. They are mitigated by defensive input validation and guard checks (e.g. tracking request IDs).`, category: 'Best Practices', difficulty: 'hard' },
    { id: 'card-4', question: `What is the primary trade-off when implementing ${cleanTopic}?`, answer: `The main trade-off is between upfront architectural setup complexity versus long-term maintainability, speed, and structural integrity.`, category: 'Trade-offs', difficulty: 'medium' },
    { id: 'card-5', question: `How can performance be optimized in ${cleanTopic}?`, answer: `Performance is optimized through memoization, lazy loading, reducing unnecessary re-computations, and batching state mutations.`, category: 'Optimization', difficulty: 'hard' },
  ];

  if (isReact) {
    cards = [
      { id: 'card-1', question: 'What is the Virtual DOM in React and why is it useful?', answer: 'The Virtual DOM is an in-memory representation of the real DOM tree. React uses diffing algorithms to reconcile updates efficiently, minimizing direct costly DOM mutations.', category: 'Core Concepts', difficulty: 'easy' },
      { id: 'card-2', question: 'How do you guard against stale closure bugs in useEffect or async callbacks?', answer: 'Use the functional state updater syntax (e.g., setVal(prev => prev + 1)) or store changing references in a useRef mutable ref object.', category: 'Hooks & State', difficulty: 'medium' },
      { id: 'card-3', question: 'What is the purpose of useRef vs useState?', answer: 'useState triggers a component re-render when mutated. useRef returns a persistent mutable object whose .current property changes without causing a re-render.', category: 'Hooks', difficulty: 'medium' },
      { id: 'card-4', question: 'Why must custom React components follow the Rules of Hooks?', answer: 'Hooks rely on call order array indices inside React internal fiber nodes. Calling hooks conditionally breaks the internal state pointer array.', category: 'Architecture', difficulty: 'hard' },
      { id: 'card-5', question: 'How do you clean up side effects in useEffect?', answer: 'Return a cleanup callback function from useEffect. React invokes this cleanup function before unmounting or re-running the effect.', category: 'Lifecycle', difficulty: 'easy' },
    ];
  }

  const quiz = [
    { id: 'quiz-1', question: `Which of the following best describes the primary goal of ${cleanTopic}?`, options: [`Achieving structured and reliable state management`, `Rendering unvalidated raw strings directly to UI`, `Bypassing error handling and network timeouts`, `Executing synchronous blocking loops on main thread`], correctIndex: 0, explanation: `${cleanTopic} emphasizes structured data validation and reliable component architectures.` },
    { id: 'quiz-2', question: `When dealing with slow API responses in ${cleanTopic}, what is the best practice?`, options: [`Do nothing and let the user wait indefinitely`, `Implement a loading state with progress feedback and request guards`, `Crash the application immediately`, `Overwrite newer responses with older stale responses`], correctIndex: 1, explanation: `Showing visual loading indicators and guarding against stale race conditions ensures a smooth UX.` },
    { id: 'quiz-3', question: `What should happen if the model returns malformed output in ${cleanTopic}?`, options: [`Render blank screen or allow React to crash`, `Catch the error defensively and display a clear ErrorState UI with retry`, `Ignore the missing fields and attempt to read undefined properties`, `Log nothing and silent fail`], correctIndex: 1, explanation: `Defensive parsing catches malformed JSON before it hits the UI, preventing blank screens or crashes.` },
    { id: 'quiz-4', question: `Which architectural layer should hold secret API keys?`, options: [`Client-side React bundle`, `Public browser local storage`, `Backend server or serverless proxy function`, `Inline HTML tags`], correctIndex: 2, explanation: `API keys must be kept out of browser bundles by routing requests through a server proxy.` },
  ];

  if (refinement) {
    cards.push({ id: `card-refine-${Date.now()}`, question: `Refined Focus: ${refinement}`, answer: `This card was newly added via the AI Refinement Loop to address: "${refinement}".`, category: 'Refined Focus', difficulty: 'hard' });
  }

  return {
    topic: cleanTopic.toUpperCase() === cleanTopic ? cleanTopic : cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1),
    summary: {
      keyTakeaways: [`Master the core fundamentals of ${cleanTopic}`, `Apply defensive validation when processing dynamic data`, `Test knowledge interactively using flashcards and quizzes`],
      prerequisites: [`General understanding of ${cleanTopic} concepts`],
      estimatedStudyTimeMinutes: cards.length * 3,
    },
    cards,
    quiz,
  };
}
