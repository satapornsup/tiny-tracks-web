import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { QuizStateService } from '../services/quiz-state.service';

/** attached to every route OUTSIDE the quiz flow (Start/Story/Home/
 *  Safety/PhotoBooth/Concept) — landing on any of them clears whatever's
 *  been answered so far, per request: leaving mid-quiz (menu drawer,
 *  header logo, browser back) has to drop progress immediately, not
 *  just on refresh. Safety included even though the NATURAL path there
 *  is Result (right after finishing) — nothing past that point ever
 *  reads the answers again (Safety/PhotoBooth/Concept don't inject
 *  QuizStateService at all), so resetting on arrival is harmless there
 *  too, and it means this rule has no exceptions to remember: any
 *  non-quiz page clears on entry, full stop. Always returns true — this
 *  never blocks navigation, it only clears state as a side effect of
 *  arriving. */
export const resetQuizGuard: CanActivateFn = () => {
  inject(QuizStateService).reset();
  return true;
};
