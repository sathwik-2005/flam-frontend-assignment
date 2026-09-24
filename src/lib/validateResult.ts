import { StudySet, EvaluationErrorDetails, Flashcard, QuizQuestion } from '../types/result';

export interface ValidationSuccess {
  isValid: true;
  data: StudySet;
}

export interface ValidationFailure {
  isValid: false;
  error: EvaluationErrorDetails;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Defensive JSON Parser & Schema Validator
 * Validates unpredictable LLM output before it ever reaches the React UI components.
 */
export function validateResult(rawText: string, defaultTopic: string = 'Study Set'): ValidationResult {
  const timestamp = new Date().toLocaleTimeString();

  // 1. Check empty or whitespace response
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return {
      isValid: false,
      error: {
        type: 'EMPTY_RESPONSE',
        title: 'Empty Model Response',
        message: 'The AI model returned an empty or blank response payload.',
        rawOutput: rawText || '(No content)',
        timestamp,
      },
    };
  }

  // Sanitize Markdown code fences if model enclosed JSON in ```json ... ```
  let sanitized = rawText.trim();
  if (sanitized.startsWith('```')) {
    sanitized = sanitized.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // 2. Parse JSON syntax
  let parsed: any;
  try {
    parsed = JSON.parse(sanitized);
  } catch (err: any) {
    return {
      isValid: false,
      error: {
        type: 'MALFORMED_JSON',
        title: 'Malformed JSON Output',
        message: `Failed to parse AI output as JSON: ${err?.message || 'Syntax error'}.`,
        rawOutput: rawText,
        timestamp,
      },
    };
  }

  // 3. Validate root object shape
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      isValid: false,
      error: {
        type: 'WRONG_SHAPE',
        title: 'Invalid Root Shape',
        message: 'Expected a root JSON object containing "cards" and "quiz" properties, but got an array or primitive.',
        rawOutput: JSON.stringify(parsed, null, 2),
        timestamp,
      },
    };
  }

  // 4. Validate cards array
  if (!Array.isArray(parsed.cards) || parsed.cards.length === 0) {
    return {
      isValid: false,
      error: {
        type: 'WRONG_SHAPE',
        title: 'Missing or Empty Cards Array',
        message: 'The response JSON must contain a non-empty "cards" array of flashcards.',
        rawOutput: JSON.stringify(parsed, null, 2),
        timestamp,
      },
    };
  }

  const validCards: Flashcard[] = [];
  for (let i = 0; i < parsed.cards.length; i++) {
    const card = parsed.cards[i];
    if (!card || typeof card !== 'object') {
      return {
        isValid: false,
        error: {
          type: 'WRONG_SHAPE',
          title: 'Malformed Flashcard Item',
          message: `Flashcard at index ${i} is not a valid object.`,
          rawOutput: JSON.stringify(parsed, null, 2),
          timestamp,
        },
      };
    }

    if (typeof card.question !== 'string' || !card.question.trim()) {
      return {
        isValid: false,
        error: {
          type: 'WRONG_SHAPE',
          title: 'Missing Flashcard Question',
          message: `Flashcard at index ${i} is missing a non-empty "question" string field.`,
          rawOutput: JSON.stringify(parsed, null, 2),
          timestamp,
        },
      };
    }

    if (typeof card.answer !== 'string' || !card.answer.trim()) {
      return {
        isValid: false,
        error: {
          type: 'WRONG_SHAPE',
          title: 'Missing Flashcard Answer',
          message: `Flashcard at index ${i} is missing a non-empty "answer" string field.`,
          rawOutput: JSON.stringify(parsed, null, 2),
          timestamp,
        },
      };
    }

    validCards.push({
      id: card.id || `card-${i + 1}-${Date.now()}`,
      question: card.question.trim(),
      answer: card.answer.trim(),
      category: typeof card.category === 'string' ? card.category : 'General',
      difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty) ? card.difficulty : 'medium',
    });
  }

  // 5. Validate quiz array
  if (!Array.isArray(parsed.quiz) || parsed.quiz.length === 0) {
    return {
      isValid: false,
      error: {
        type: 'WRONG_SHAPE',
        title: 'Missing or Empty Quiz Array',
        message: 'The response JSON must contain a non-empty "quiz" array of multiple-choice questions.',
        rawOutput: JSON.stringify(parsed, null, 2),
        timestamp,
      },
    };
  }

  const validQuiz: QuizQuestion[] = [];
  for (let i = 0; i < parsed.quiz.length; i++) {
    const q = parsed.quiz[i];
    if (!q || typeof q !== 'object') {
      return {
        isValid: false,
        error: {
          type: 'WRONG_SHAPE',
          title: 'Malformed Quiz Item',
          message: `Quiz question at index ${i} is not a valid object.`,
          rawOutput: JSON.stringify(parsed, null, 2),
          timestamp,
        },
      };
    }

    if (typeof q.question !== 'string' || !q.question.trim()) {
      return {
        isValid: false,
        error: {
          type: 'WRONG_SHAPE',
          title: 'Missing Quiz Question Text',
          message: `Quiz question at index ${i} is missing a "question" string field.`,
          rawOutput: JSON.stringify(parsed, null, 2),
          timestamp,
        },
      };
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      return {
        isValid: false,
        error: {
          type: 'WRONG_SHAPE',
          title: 'Invalid Quiz Options',
          message: `Quiz question at index ${i} must contain an "options" array with at least 2 choices.`,
          rawOutput: JSON.stringify(parsed, null, 2),
          timestamp,
        },
      };
    }

    const correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
    if (correctIndex < 0 || correctIndex >= q.options.length) {
      return {
        isValid: false,
        error: {
          type: 'WRONG_SHAPE',
          title: 'Invalid Correct Index',
          message: `Quiz question at index ${i} has correctIndex ${correctIndex}, which is out of bounds for options length ${q.options.length}.`,
          rawOutput: JSON.stringify(parsed, null, 2),
          timestamp,
        },
      };
    }

    validQuiz.push({
      id: q.id || `quiz-${i + 1}-${Date.now()}`,
      question: q.question.trim(),
      options: q.options.map((opt: any) => String(opt || '').trim()),
      correctIndex,
      explanation: typeof q.explanation === 'string' && q.explanation.trim()
        ? q.explanation.trim()
        : `Option ${correctIndex + 1} is the correct answer based on core concepts.`,
    });
  }

  // 6. Build validated study summary
  const summary = {
    keyTakeaways: Array.isArray(parsed.summary?.keyTakeaways)
      ? parsed.summary.keyTakeaways.map(String)
      : ['Review concepts regularly for best retention', 'Practice the interactive quiz mode to test recall'],
    prerequisites: Array.isArray(parsed.summary?.prerequisites)
      ? parsed.summary.prerequisites.map(String)
      : ['Basic familiarity with the subject matter'],
    estimatedStudyTimeMinutes: typeof parsed.summary?.estimatedStudyTimeMinutes === 'number'
      ? parsed.summary.estimatedStudyTimeMinutes
      : Math.max(5, validCards.length * 2),
  };

  const validatedSet: StudySet = {
    id: `set-${Date.now()}`,
    topic: parsed.topic || defaultTopic,
    createdAt: new Date().toISOString(),
    summary,
    cards: validCards,
    quiz: validQuiz,
  };

  return {
    isValid: true,
    data: validatedSet,
  };
}
