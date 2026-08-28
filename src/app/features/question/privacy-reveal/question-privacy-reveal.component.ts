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

  /** just whether the confirm checkbox is ticked — gates Next (see
   *  QuestionShellComponent's own nextDisabled), doesn't by itself say
   *  right or wrong. Used to double as that too (see confirmedVia/
   *  isCorrect below for why that broke): checking the box while the
   *  modal happened to be open/closed at that exact instant got baked
   *  in as the permanent answer, so ticking confirm while revealed, THEN
   *  opening "PRIVATE CONTENT" before actually pressing Next, still
   *  recorded 'revealed' — the answer never re-checked itself against
   *  what was actually on screen by the time Next was pressed. */
  readonly confirmed = signal(false);

  /** the "PRIVATE CONTENT" dialog — closed by default, so arriving fresh
   *  from Q1 lands straight on the revealed page (per the latest design:
   *  the modal is something the player opts INTO via the "PRIVATE
   *  CONTENT" button in the stage, not a forced blocker on entry).
   *  Restoring an answer of 'modal' opens it instead, in ngOnInit below:
   *  that answer only exists because the player had it open at the
   *  moment they left, so landing on the revealed page on Back would
   *  show a state that never matched what they actually left on. */
  readonly modalOpen = signal(false);

  /** live at read-time, not frozen at confirm-time — whatever the modal
   *  actually is showing the MOMENT this is read (QuestionShellComponent
   *  reads it when Next is pressed, see that component's onNext) is what
   *  gets scored/recorded, matching whatever the player is actually
   *  looking at right then rather than whatever it was when they first
   *  ticked confirm. */
  readonly confirmedVia = computed<PrivacyConfirmSource>(() =>
    this.modalOpen() ? 'modal' : 'revealed',
  );

  /** read by QuestionShellComponent when its own Next is pressed */
  readonly isCorrect = computed(() => this.modalOpen());

  ngOnInit(): void {
    const restored = this.initialConfirmedVia();
    if (restored !== null) {
      this.confirmed.set(true);
      this.modalOpen.set(restored === 'modal');
    }
  }

  onConfirmChange(checked: boolean): void {
    this.confirmed.set(checked);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  openModal(): void {
    this.modalOpen.set(true);
  }
}
