import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { PageTransitionService } from '../services/page-transition.service';

/** plays the exit fade and holds navigation until it finishes — the
 *  "deferred activation" from CLAUDE.md, so the old route doesn't get
 *  swapped out mid-animation */
export const pageTransitionGuard: CanDeactivateFn<unknown> = () => {
  const pageTransition = inject(PageTransitionService);
  return pageTransition.fadeOut().then(() => true);
};
