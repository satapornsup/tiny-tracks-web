import { QuestionId } from '../../shared/services/quiz-state.service';

export type QuestionInteractionType =
  | 'swipe-card'
  | 'outfit-picker'
  | 'privacy-reveal'
  | 'work-clock'
  | 'curtain'
  | 'placeholder';

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

/** Q2's two confirm points feed one answer — 'modal' (confirmed without
 *  ever revealing the private info) is the correct choice, 'revealed'
 *  (confirmed only after opening it) is the wrong one. Only one can ever
 *  be set at a time — see question-privacy-reveal.component.ts. */
export type PrivacyConfirmSource = 'modal' | 'revealed';

/** Q3's 4 job offers — each is its own independent toggle (not a single
 *  radio choice), so each carries its own correct on/off answer. `corner`
 *  is fixed layout position around the clock, not just data order, since
 *  the top-row and bottom-row cards read in a different internal order
 *  (see question-work-clock.component.html). */
export interface WorkOffer {
  id: string;
  amount: string;
  timeRange: string;
  isCorrectOn: boolean;
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface QuestionConfig {
  id: QuestionId;
  interactionType: QuestionInteractionType;
  prompt: string;
  options?: SwipeCardOption[];
  items?: OutfitItem[];
  workOffers?: WorkOffer[];
}
