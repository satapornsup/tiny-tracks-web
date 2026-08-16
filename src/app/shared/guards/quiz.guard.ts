import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { QuizStateService } from '../services/quiz-state.service';

/** blocks direct entry into /question/:id and /result — refresh or a
 *  typed-in URL both land here with hasEntered() false (nothing
 *  persists it), so both get sent back to Start the same way */
export const quizGuard: CanActivateFn = () => {
  const quizState = inject(QuizStateService);
  const router = inject(Router);
  return quizState.hasEntered() ? true : router.parseUrl('/');
};
