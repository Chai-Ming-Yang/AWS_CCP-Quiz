export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuestionGroup {
  section: string;
  questions: Question[];
}

export interface QuizDatabase {
  easy: QuestionGroup[];
  hard: QuestionGroup[];
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  wrongQuestions: string[];
}

export interface AttemptHistory {
  date: string;
  score: number;
  total: number;
  type: 'session';
  context?: string;
}

export interface QuizState {
  attempts: number;
  history: AttemptHistory[];
  wrongQuestions: string[];
  recordAttempt: (result: QuizResult, type: 'session', context?: string) => void;
  clearHistory: () => void;
}