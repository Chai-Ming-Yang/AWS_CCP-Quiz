import type { Question, QuizResult } from '../types';

/**
 * Pure function to evaluate a user's answers against the question set.
 */
export const evaluateQuiz = (
  questions: Question[], 
  userAnswers: Record<string, number>
): QuizResult => {
  let score = 0;
  const wrongQuestions: string[] = [];

  questions.forEach(q => {
    const userAnswer = userAnswers[q.id];
    if (userAnswer === q.correctAnswer) {
      score += 1;
    } else {
      wrongQuestions.push(q.id);
    }
  });

  const total = questions.length;
  // Prevent division by zero if an empty quiz is somehow evaluated
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return {
    score,
    total,
    percentage,
    wrongQuestions
  };
};