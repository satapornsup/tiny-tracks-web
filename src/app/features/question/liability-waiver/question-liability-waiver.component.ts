import { Component, OnInit, computed, input, signal } from '@angular/core';
import { ConfirmCheckboxComponent } from '../../../shared/components/confirm-checkbox/confirm-checkbox.component';

/** the 3 fixed risk cards from the reference mockup (aคำถาม6.png) — not
 *  data-driven via question-data.ts like WorkOffer/OutfitItem, since each
 *  card's art/layout is genuinely bespoke (speech-bubble portrait vs.
 *  polaroid+item pair vs. peeking-over-tub shot), same call already made
 *  for Q5's curtain FaceConfig array */
export type WaiverItemId = 'bullied' | 'harassed' | 'impersonated';

@Component({
  selector: 'app-question-liability-waiver',
  standalone: true,
  imports: [ConfirmCheckboxComponent],
  templateUrl: './question-liability-waiver.component.html',
  styleUrl: './question-liability-waiver.component.scss',
})
export class QuestionLiabilityWaiverComponent implements OnInit {
  /** previously-recorded ticks, if navigating BACK to this question (Back
   *  from Q2-Q6 keeps state per CLAUDE.md §7) — null on a genuinely first
   *  visit, same inference every other question widget's initial-value
   *  input makes (non-null here also implies "was confirmed") */
  readonly initialAccepted = input<Record<WaiverItemId, boolean> | null>(null);

  readonly accepted = signal<Record<WaiverItemId, boolean>>({
    bullied: false,
    harassed: false,
    impersonated: false,
  });
  readonly confirmed = signal(false);

  /** correct = ticked "ยอมรับ" (accept) on NONE of the 3 — a company
   *  disclaiming responsibility for bullying/harassment/impersonation
   *  isn't something to consent to, unlike every other question here
   *  where some particular combination of ticks is the correct one */
  readonly isCorrect = computed(() => Object.values(this.accepted()).every((v) => !v));

  ngOnInit(): void {
    const restored = this.initialAccepted();
    if (restored) {
      this.accepted.set(restored);
      this.confirmed.set(true);
    }
  }

  isAccepted(id: WaiverItemId): boolean {
    return this.accepted()[id];
  }

  toggle(id: WaiverItemId): void {
    this.accepted.update((a) => ({ ...a, [id]: !a[id] }));
    // same "changing the answer un-confirms it" rule as every other question
    this.confirmed.set(false);
  }
}
