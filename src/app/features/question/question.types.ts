import { QuestionId } from '../../shared/services/quiz-state.service';

export type QuestionInteractionType = 'swipe-card' | 'placeholder';

export interface SwipeCardOption {
  id: string;
  label: string;
  image: string;
  isCorrect: boolean;
}

export interface QuestionConfig {
  id: QuestionId;
  interactionType: QuestionInteractionType;
  prompt: string;
  options?: SwipeCardOption[];
}
