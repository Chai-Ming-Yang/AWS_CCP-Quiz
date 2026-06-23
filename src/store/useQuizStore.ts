import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuizState, QuizResult } from '../core/types';

export const useQuizStore = create<QuizState>()(
  persist<QuizState>(
    (set) => ({
      attempts: 0,
      history: [],
      wrongQuestions: [],
      categoryStats: {},

      recordAttempt: (result: QuizResult, type: 'exam' | 'category', categoryContext?: string) => set((state: QuizState) => {
        const newHistoryEntry = {
          date: new Date().toISOString(),
          score: result.score,
          total: result.total,
          type,
          categoryContext
        };

        // Maintain unique wrong questions for review
        const updatedWrongQuestions = Array.from(
          new Set([...state.wrongQuestions, ...result.wrongQuestions])
        );

        return {
          attempts: state.attempts + 1,
          history: [...state.history, newHistoryEntry],
          wrongQuestions: updatedWrongQuestions,
        };
      }),

      clearHistory: () => set({
        attempts: 0,
        history: [],
        wrongQuestions: [],
        categoryStats: {}
      })
    }),
    {
      name: 'aws-quiz-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);