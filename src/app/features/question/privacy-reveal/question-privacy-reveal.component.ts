import { Component, computed, input, OnInit, signal } from '@angular/core';
import { ConfirmCheckboxComponent } from '../../../shared/components/confirm-checkbox/confirm-checkbox.component';
import { PrivacyConfirmSource } from '../question.types';

@Component({
  selector: 'app-question-privacy-reveal',
  standalone: true,
  imports: [ConfirmCheckboxComponent],
  templateUrl: './question-privacy-reveal.component.html',
  styleUrl: './question-privacy-reveal.component.scss',
})
export class QuestionPrivacyRevealComponent implements OnInit {
  /** which confirm point was already used last time (Back from Q3 keeps
   *  state per CLAUDE.md §7) — read in ngOnInit, not the constructor:
   *  Angular only guarantees a bound input value is in place by ngOnInit
   *  (see question-swipe-card.component.ts for the bug this same mistake
   *  caused). null on a genuinely first visit. */
  readonly initialConfirmedVia = input<PrivacyConfirmSource | null>(null);

  /** the actual scored state — there's only one confirm checkbox on
   *  screen (same spot as every other question's, back/next float over
   *  the modal same as it), so this can't come from two different
   *  elements. Instead onConfirmChange reads whether the modal is still
   *  open at the moment it's pressed: confirming while it's still up
   *  (never revealing the private info) is 'modal' and correct;
   *  confirming after it's been closed is 'revealed' and wrong. */
  readonly confirmedVia = signal<PrivacyConfirmSource | null>(null);

  /** read by QuestionShellComponent to gate its own Next button — true
   *  the moment either confirm point is used, regardless of which */
  readonly confirmed = computed(() => this.confirmedVia() !== null);

  /** read by QuestionShellComponent when its own Next is pressed */
  readonly isCorrect = computed(() => this.confirmedVia() === 'modal');

  /** the "PRIVATE CONTENT" dialog — closed by default, so arriving fresh
   *  from Q1 lands straight on the revealed page (per the latest design:
   *  the modal is something the player opts INTO via the "PRIVATE
   *  CONTENT" button in the stage, not a forced blocker on entry).
   *  Restoring an answer of 'modal' opens it instead, in ngOnInit below:
   *  that answer only exists because the player confirmed WITHOUT ever
   *  closing it, so landing on the revealed page on Back would show a
   *  state that never matched what they actually did. Restoring
   *  'revealed' leaves it closed (the default) for the same reason in
   *  reverse — that answer means they'd already closed it before
   *  confirming. */
  readonly modalOpen = signal(false);

  ngOnInit(): void {
    const restored = this.initialConfirmedVia();
    this.confirmedVia.set(restored);
    if (restored === 'modal') {
      this.modalOpen.set(true);
    }
  }

  onConfirmChange(checked: boolean): void {
    this.confirmedVia.set(checked ? (this.modalOpen() ? 'modal' : 'revealed') : null);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  openModal(): void {
    this.modalOpen.set(true);
  }
}
