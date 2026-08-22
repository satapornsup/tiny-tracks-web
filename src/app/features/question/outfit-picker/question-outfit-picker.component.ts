import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';
import { ConfirmCheckboxComponent } from '../../../shared/components/confirm-checkbox/confirm-checkbox.component';
import { OutfitItem } from '../question.types';

@Component({
  selector: 'app-question-outfit-picker',
  standalone: true,
  imports: [ConfirmCheckboxComponent],
  templateUrl: './question-outfit-picker.component.html',
  styleUrl: './question-outfit-picker.component.scss',
})
export class QuestionOutfitPickerComponent implements OnInit {
  readonly items = input.required<readonly OutfitItem[]>();
  /** previously-recorded top/bottom ids, if the player is navigating BACK
   *  to this question (Back from Q2-Q6 keeps state per CLAUDE.md §7) —
   *  null on a genuinely first visit. Same gap as the swipe-card had:
   *  nothing was reading these before, so Back always looked like the
   *  outfit had been wiped even though QuizStateService still had it. */
  readonly initialTopId = input<string | null>(null);
  readonly initialBottomId = input<string | null>(null);

  readonly selectedTopId = signal<string | null>(null);
  readonly selectedBottomId = signal<string | null>(null);
  readonly confirmed = signal(false);

  readonly leftItems = computed(() => this.items().filter((item) => item.column === 'left'));
  readonly rightItems = computed(() => this.items().filter((item) => item.column === 'right'));

  readonly selectedTop = computed(() => this.items().find((item) => item.id === this.selectedTopId()) ?? null);
  readonly selectedBottom = computed(
    () => this.items().find((item) => item.id === this.selectedBottomId()) ?? null,
  );

  readonly hasFullOutfit = computed(() => !!this.selectedTopId() && !!this.selectedBottomId());

  /** read by QuestionShellComponent when its own Next is pressed */
  readonly isCorrect = computed(() => !!this.selectedTop()?.isCorrect && !!this.selectedBottom()?.isCorrect);

  private readonly topImg = viewChild<ElementRef<HTMLImageElement>>('topImg');
  private readonly bottomImg = viewChild<ElementRef<HTMLImageElement>>('bottomImg');
  private topTween: gsap.core.Tween | null = null;
  private bottomTween: gsap.core.Tween | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.topTween?.kill();
      this.bottomTween?.kill();
    });

    /* fade + scale-up bounce every time the equipped top/bottom changes
     * (including swapping directly from one item to another, not just
     * null→item) — effect() re-runs after the @if block's DOM update has
     * already landed, so the img the viewChild resolves to is always the
     * one for the item just equipped */
    effect(() => {
      const id = this.selectedTopId();
      const img = this.topImg()?.nativeElement;
      if (id && img) {
        this.animateEquip(img, 'top');
      }
    });
    effect(() => {
      const id = this.selectedBottomId();
      const img = this.bottomImg()?.nativeElement;
      if (id && img) {
        this.animateEquip(img, 'bottom');
      }
    });
  }

  /* required inputs throw (NG0950) and optional inputs still hold their
   * static default if read in the constructor — Angular only guarantees
   * bound input values are in place by ngOnInit. This restores a
   * previously-picked outfit (Back from Q6 per CLAUDE.md §7) instead of
   * always starting empty — that was the actual bug: nothing ever read
   * initialTopId/initialBottomId at a point where they held the real
   * bound value, so Back always looked like the outfit had been wiped
   * even though QuizStateService still had it. */
  ngOnInit(): void {
    const prevTop = this.initialTopId();
    const prevBottom = this.initialBottomId();
    if (prevTop) this.selectedTopId.set(prevTop);
    if (prevBottom) this.selectedBottomId.set(prevBottom);
    if (prevTop && prevBottom) this.confirmed.set(true);
  }

  select(item: OutfitItem): void {
    if (item.type === 'top') {
      this.selectedTopId.set(item.id);
    } else {
      this.selectedBottomId.set(item.id);
    }
    this.confirmed.set(false);
  }

  private animateEquip(img: HTMLImageElement, slot: 'top' | 'bottom'): void {
    if (slot === 'top') {
      this.topTween?.kill();
    } else {
      this.bottomTween?.kill();
    }
    const tween = gsap.fromTo(
      img,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', transformOrigin: 'center center' },
    );
    if (slot === 'top') {
      this.topTween = tween;
    } else {
      this.bottomTween = tween;
    }
  }
}
