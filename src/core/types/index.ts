export interface Question {
  id: string;
  category: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface PracticeSet {
  id: string;
  title: string;
  questions: Question[];
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
  type: 'exam' | 'category';
  categoryContext?: string;
}

export interface QuizState {
  attempts: number;
  history: AttemptHistory[];
  wrongQuestions: string[];
  categoryStats: Record<string, number>;
  recordAttempt: (result: QuizResult, type: 'exam' | 'category', categoryContext?: string) => void;
  clearHistory: () => void;
}