export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudySummary {
  keyTakeaways: string[];
  prerequisites: string[];
  estimatedStudyTimeMinutes: number;
}

export interface StudySet {
  id: string;
  topic: string;
  createdAt: string;
  summary: StudySummary;
  cards: Flashcard[];
  quiz: QuizQuestion[];
}

export type ErrorType = 
  | 'MALFORMED_JSON'
  | 'WRONG_SHAPE'
  | 'EMPTY_RESPONSE'
  | 'TIMEOUT'
  | 'FAILED_REQUEST'
  | 'UNKNOWN';

export interface EvaluationErrorDetails {
  type: ErrorType;
  title: string;
  message: string;
  rawOutput?: string;
  timestamp: string;
}

export interface GenerateApiRequest {
  prompt: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  count?: number;
  refinement?: string;
  existingSet?: StudySet;
  simulateError?: 'none' | 'malformed' | 'wrong_shape' | 'slow' | 'empty' | 'failed';
}

export interface GenerateApiResponse {
  success: boolean;
  data?: StudySet;
  rawJson?: string;
  error?: EvaluationErrorDetails;
}
