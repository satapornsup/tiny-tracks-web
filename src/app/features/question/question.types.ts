import { QuestionId } from '../../shared/services/quiz-state.service';

export type QuestionInteractionType = 'swipe-card' | 'outfit-picker' | 'placeholder';

export interface SwipeCardOption {
  id: string;
  label: string;
  image: string;
  isCorrect: boolean;
}

/** Q5 dress-up piece — `column` mirrors the design mockup's fixed left/right
 *  thumbnail layout (which mixes tops and bottoms), while `type` drives the
 *  actual equip logic: a top can only ever occupy the top slot on the
 *  character, a bottom only the bottom slot, regardless of which column
 *  it's listed in. */
export interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom';
  column: 'left' | 'right';
  isCorrect: boolean;
}

export interface QuestionConfig {
  id: QuestionId;
  interactionType: QuestionInteractionType;
  prompt: string;
  options?: SwipeCardOption[];
  items?: OutfitItem[];
}
