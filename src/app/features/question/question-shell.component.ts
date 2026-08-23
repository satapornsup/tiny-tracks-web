import { Component, computed, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StickyNoteButtonComponent } from '../../shared/components/sticky-note-button/sticky-note-button.component';
import {
  QuestionId,
  QuizStateService,
} from '../../shared/services/quiz-state.service';
import { QuestionOutfitPickerComponent } from './outfit-picker/question-outfit-picker.component';
import { QuestionPrivacyRevealComponent } from './privacy-reveal/question-privacy-reveal.component';
import { QUESTIONS } from './question-data';
import { PrivacyConfirmSource } from './question.types';
import { QuestionSwipeCardComponent } from './swipe-card/question-swipe-card.component';
import { QuestionWorkClockComponent } from './work-clock/question-work-clock.component';

@Component({
  selector: 'app-question-shell',
  standalone: true,
  imports: [
    HeaderComponent,
    StickyNoteButtonComponent,
    QuestionSwipeCardComponent,
    QuestionOutfitPickerComponent,
    QuestionPrivacyRevealComponent,
    QuestionWorkClockComponent,
  ],
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

  /** whatever was recorded for this question last time (Back from Q2-Q6
   *  keeps answers per CLAUDE.md §7), read once — the sub-widgets below
   *  only need this to seed their OWN initial selection, not react to it
   *  afterward. undefined on a first visit. */
  private readonly previousAnswer = this.quizState.getAnswer(this.questionId);
  readonly initialSwipeAnswerId =
    (this.previousAnswer?.value as string | null | undefined) ?? null;
  private readonly previousOutfit = this.previousAnswer?.value as
    | { top: string | null; bottom: string | null }
    | undefined;
  readonly initialOutfitTopId = this.previousOutfit?.top ?? null;
  readonly initialOutfitBottomId = this.previousOutfit?.bottom ?? null;
  readonly initialPrivacyConfirmedVia =
    (this.previousAnswer?.value as PrivacyConfirmSource | undefined) ?? null;
  readonly initialWorkToggles =
    (this.previousAnswer?.value as Record<string, boolean> | undefined) ?? null;

  private readonly swipeCard = viewChild(QuestionSwipeCardComponent);
  private readonly outfitPicker = viewChild(QuestionOutfitPickerComponent);
  private readonly privacyReveal = viewChild(QuestionPrivacyRevealComponent);
  private readonly workClock = viewChild(QuestionWorkClockComponent);

  /** swipe-card and outfit-picker questions need an explicit confirm tick
   *  before Next unlocks (outfit-picker also needs both slots filled);
   *  other interaction types don't gate Next on anything yet */
  readonly nextDisabled = computed(() => {
    if (this.config.interactionType === 'swipe-card') {
      return !this.swipeCard()?.confirmed();
    }
    if (this.config.interactionType === 'outfit-picker') {
      const picker = this.outfitPicker();
      return !(picker?.hasFullOutfit() && picker?.confirmed());
    }
    if (this.config.interactionType === 'privacy-reveal') {
      return !this.privacyReveal()?.confirmed();
    }
    if (this.config.interactionType === 'work-clock') {
      return !this.workClock()?.confirmed();
    }
    return false;
  });

  onNext(): void {
    if (this.config.interactionType === 'swipe-card') {
      const option = this.swipeCard()?.current();
      this.quizState.recordAnswer(
        this.questionId,
        option?.id ?? null,
        option?.isCorrect ?? false,
      );
    } else if (this.config.interactionType === 'outfit-picker') {
      const picker = this.outfitPicker();
      const value = {
        top: picker?.selectedTop()?.id ?? null,
        bottom: picker?.selectedBottom()?.id ?? null,
      };
      this.quizState.recordAnswer(
        this.questionId,
        value,
        picker?.isCorrect() ?? false,
      );
    } else if (this.config.interactionType === 'privacy-reveal') {
      const reveal = this.privacyReveal();
      this.quizState.recordAnswer(
        this.questionId,
        reveal?.confirmedVia() ?? null,
        reveal?.isCorrect() ?? false,
      );
    } else if (this.config.interactionType === 'work-clock') {
      const clock = this.workClock();
      this.quizState.recordAnswer(
        this.questionId,
        clock?.toggles() ?? null,
        clock?.isCorrect() ?? false,
      );
    } else {
      // stub questions (Q2/Q3/Q4/Q6 pending design) still need a
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
