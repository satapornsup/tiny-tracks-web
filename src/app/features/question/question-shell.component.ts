import { Component, computed, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StickyNoteButtonComponent } from '../../shared/components/sticky-note-button/sticky-note-button.component';
import { QuestionId, QuizStateService } from '../../shared/services/quiz-state.service';
import { QUESTIONS } from './question-data';
import { QuestionSwipeCardComponent } from './swipe-card/question-swipe-card.component';

@Component({
  selector: 'app-question-shell',
  standalone: true,
  imports: [HeaderComponent, StickyNoteButtonComponent, QuestionSwipeCardComponent],
  templateUrl: './question-shell.component.html',
  styleUrl: './question-shell.component.scss',
})
export class QuestionShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quizState = inject(QuizStateService);

  /* each question is its own literal route (see app.routes.ts) rather
     than one "/question/:id" — that way Angular treats Q1→Q2 as a real
     route change (not a param-only reuse), so the shared
     pageTransitionGuard/cross-fade actually fires between questions
     the same way it does everywhere else */
  readonly questionId = this.route.snapshot.data['questionId'] as QuestionId;
  readonly config = QUESTIONS.find((q) => q.id === this.questionId)!;

  private readonly swipeCard = viewChild(QuestionSwipeCardComponent);

  /** swipe-card questions need an explicit confirm tick before Next
   *  unlocks; other interaction types don't gate Next on anything yet */
  readonly nextDisabled = computed(() => {
    if (this.config.interactionType === 'swipe-card') {
      return !this.swipeCard()?.confirmed();
    }
    return false;
  });

  onNext(): void {
    if (this.config.interactionType === 'swipe-card') {
      const option = this.swipeCard()?.current();
      this.quizState.recordAnswer(this.questionId, option?.id ?? null, option?.isCorrect ?? false);
    } else {
      // stub questions (Q2/Q3/Q4/Q5/Q6 pending design) still need a
      // recorded entry so the result recap has something for every id
      this.quizState.recordAnswer(this.questionId, null, false);
    }
    this.goNext();
  }

  goBack(): void {
    if (this.questionId <= 1) {
      this.quizState.reset();
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/question', this.questionId - 1]);
    }
  }

  private goNext(): void {
    if (this.questionId >= 6) {
      this.router.navigate(['/result']);
    } else {
      this.router.navigate(['/question', this.questionId + 1]);
    }
  }
}
