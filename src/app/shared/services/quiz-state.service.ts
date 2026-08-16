import { Injectable, computed, signal } from '@angular/core';

export type QuestionId = 1 | 2 | 3 | 4 | 5 | 6;

export interface QuestionAnswer {
  value: unknown;
  isCorrect: boolean;
}

/* in-memory only, on purpose — no sessionStorage. A full refresh wipes
   this (and hasEntered with it), which is exactly what sends the player
   back to Start via quizGuard. See CLAUDE.md §7 for why this was chosen
   over persisting. */
@Injectable({ providedIn: 'root' })
export class QuizStateService {
  readonly hasEntered = signal(false);

  private readonly answers = signal<Partial<Record<QuestionId, QuestionAnswer>>>({});
  readonly allAnswers = computed(() => this.answers());

  enterQuiz(): void {
    this.hasEntered.set(true);
  }

  recordAnswer(id: QuestionId, value: unknown, isCorrect: boolean): void {
    this.answers.update((current) => ({ ...current, [id]: { value, isCorrect } }));
  }

  getAnswer(id: QuestionId): QuestionAnswer | undefined {
    return this.answers()[id];
  }

  reset(): void {
    this.answers.set({});
    this.hasEntered.set(false);
  }
}
