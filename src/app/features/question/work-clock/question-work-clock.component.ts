import { Component, computed, input, OnInit, signal } from '@angular/core';
import { ConfirmCheckboxComponent } from '../../../shared/components/confirm-checkbox/confirm-checkbox.component';
import { WorkOffer } from '../question.types';

@Component({
  selector: 'app-question-work-clock',
  standalone: true,
  imports: [ConfirmCheckboxComponent],
  templateUrl: './question-work-clock.component.html',
  styleUrl: './question-work-clock.component.scss',
})
export class QuestionWorkClockComponent implements OnInit {
  readonly offers = input.required<readonly WorkOffer[]>();

  /** which offers were already switched on last time (Back from Q4 keeps
   *  state per CLAUDE.md §7) — read in ngOnInit, not the constructor:
   *  Angular only guarantees a bound input value is in place by ngOnInit
   *  (see question-swipe-card.component.ts for the bug this same mistake
   *  caused). null on a genuinely first visit — recordAnswer only ever
   *  runs from onNext, which requires confirmed to already be true, so a
   *  non-null value here also means "was confirmed", same inference
   *  question-swipe-card.component.ts makes from its own initialAnswerId. */
  readonly initialToggles = input<Record<string, boolean> | null>(null);

  /** each offer toggles independently — not a radio choice among the 4,
   *  confirmed by the user (see AskUserQuestion answer) */
  readonly toggles = signal<Record<string, boolean>>({});
  readonly confirmed = signal(false);

  /** read by QuestionShellComponent when its own Next is pressed — every
   *  single offer's on/off state has to match the answer key, same
   *  all-or-nothing scoring as outfit-picker's top+bottom pair */
  readonly isCorrect = computed(() => this.offers().every((o) => !!this.toggles()[o.id] === o.isCorrectOn));

  ngOnInit(): void {
    const restored = this.initialToggles();
    this.toggles.set(restored ?? Object.fromEntries(this.offers().map((o) => [o.id, false])));
    if (restored) {
      this.confirmed.set(true);
    }
  }

  offerAt(corner: WorkOffer['corner']): WorkOffer | undefined {
    return this.offers().find((o) => o.corner === corner);
  }

  isOn(id: string): boolean {
    return !!this.toggles()[id];
  }

  toggle(id: string): void {
    this.toggles.update((t) => ({ ...t, [id]: !t[id] }));
    // same "changing the answer un-confirms it" rule as swipe-card/outfit-picker
    this.confirmed.set(false);
  }
}
