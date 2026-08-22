import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';
import { ConfirmCheckboxComponent } from '../../../shared/components/confirm-checkbox/confirm-checkbox.component';
import { SwipeCardOption } from '../question.types';

@Component({
  selector: 'app-question-swipe-card',
  standalone: true,
  imports: [ConfirmCheckboxComponent],
  templateUrl: './question-swipe-card.component.html',
  styleUrl: './question-swipe-card.component.scss',
})
export class QuestionSwipeCardComponent implements OnInit {
  readonly options = input.required<readonly SwipeCardOption[]>();
  /** the id of whatever was recorded last time this question was
   *  answered, if the player is navigating BACK to it (Back from Q2-Q6
   *  keeps state per CLAUDE.md §7 — only Back from Q1 itself resets).
   *  null on a genuinely first visit. */
  readonly initialAnswerId = input<string | null>(null);

  readonly index = signal(0);
  readonly confirmed = signal(false);

  /** read by QuestionShellComponent (via viewChild) when its own Next
   *  icon is pressed — this component only browses, the shell decides
   *  when "whatever's showing now" becomes the recorded answer */
  readonly current = computed(() => this.options()[this.index()]);

  private readonly photoImg = viewChild<ElementRef<HTMLImageElement>>('photoImg');
  private tween: gsap.core.Timeline | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.tween?.kill());
  }

  /* required inputs throw (NG0950) and optional inputs still hold their
   * static default if read in the constructor — Angular only guarantees
   * bound input values are in place by ngOnInit. This seeds
   * index/confirmed from the prior answer instead of always starting at
   * option 0 / unconfirmed — that was the actual bug: nothing ever
   * restored from initialAnswerId, so Back always looked like the answer
   * had been wiped even though QuizStateService still had it. */
  ngOnInit(): void {
    const prevId = this.initialAnswerId();
    if (prevId) {
      const prevIndex = this.options().findIndex((option) => option.id === prevId);
      if (prevIndex >= 0) {
        this.index.set(prevIndex);
        this.confirmed.set(true);
      }
    }
  }

  prev(): void {
    this.browse(-1);
  }

  next(): void {
    this.browse(1);
  }

  /** slide the current photo out one side and the next one in from the
   *  other — mimics flicking through IG-style posts. -1 = prev (out to
   *  the right, in from the left), 1 = next (out left, in from right) */
  private browse(direction: -1 | 1): void {
    const total = this.options().length;
    const img = this.photoImg()?.nativeElement;

    if (!img) {
      this.index.update((i) => (i + direction + total) % total);
      this.confirmed.set(false);
      return;
    }

    this.tween?.kill();
    this.tween = gsap.timeline();
    this.tween
      .to(img, { xPercent: -direction * 100, opacity: 0, duration: 0.16, ease: 'power1.in' })
      .call(() => {
        this.index.update((i) => (i + direction + total) % total);
        this.confirmed.set(false);
      })
      .set(img, { xPercent: direction * 100 })
      .to(img, { xPercent: 0, opacity: 1, duration: 0.22, ease: 'power2.out' });
  }
}
