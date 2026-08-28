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
  viewChildren,
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

  private readonly photoImg =
    viewChild<ElementRef<HTMLImageElement>>('photoImg');
  private readonly counterText =
    viewChild<ElementRef<HTMLElement>>('counterText');
  private readonly dotEls = viewChildren<ElementRef<HTMLElement>>('dotEl');
  private tween: gsap.core.Timeline | null = null;

  /** URLs the browser has actually finished fetching+decoding — keyed
   *  independently of the visible <img>'s own [src] binding (see
   *  preload() below for why). */
  private readonly loaded = new Set<string>();

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
      const prevIndex = this.options().findIndex(
        (option) => option.id === prevId,
      );
      if (prevIndex >= 0) {
        this.index.set(prevIndex);
        this.confirmed.set(true);
      }
    }

    /* eager, best-effort — there's only ever a handful of options, so
       by the time anyone actually swipes these have almost always
       already finished. The real fix is in browse() below regardless
       (a fast first swipe could still beat this to it). */
    for (const option of this.options()) this.preload(option.image);
  }

  /** resolves once `src` is actually decoded and paint-ready — keyed by
   *  URL rather than tied to the visible <img> element, since Angular's
   *  own [src] binding update (from the index signal set in browse()
   *  below) doesn't happen synchronously, so there's no reliable moment
   *  to attach a `load` listener to that SPECIFIC element for THIS
   *  specific swap. A plain Image() pointed at the same URL hits the
   *  same browser HTTP/decode cache regardless of which element
   *  eventually displays it, so this resolving means the real <img>'s
   *  own paint will be instant whenever its binding does flush. */
  private preload(src: string): Promise<void> {
    if (this.loaded.has(src)) return Promise.resolve();
    return new Promise((resolve) => {
      const probe = new Image();
      probe.onload = () => {
        this.loaded.add(src);
        resolve();
      };
      probe.onerror = () => resolve();
      probe.src = src;
    });
  }

  prev(): void {
    this.browse(-1);
  }

  next(): void {
    this.browse(1);
  }

  /** slide the current photo out one side and the next one in from the
   *  other — mimics flicking through IG-style posts. -1 = prev (out to
   *  the right, in from the left), 1 = next (out left, in from right)
   *
   *  The fade-BACK-in used to be baked into the same timeline as a flat
   *  0.22s tween, right after the index swap — that was the actual bug
   *  reported ("แว้บๆขาวๆ", a white flash mid-swipe): changing the
   *  index signal changes the <img>'s [src], but the BROWSER clears an
   *  <img>'s painted content the instant its src changes, not once the
   *  new one has actually finished decoding — so that fixed-duration
   *  tween was fading opacity up over a still-blank box whenever the
   *  new photo hadn't already been cached. Splitting the timeline so
   *  the fade-in only starts once preload() resolves for that specific
   *  URL fixes it regardless of whether it was ever preloaded ahead of
   *  time. */
  private browse(direction: -1 | 1): void {
    const total = this.options().length;
    const img = this.photoImg()?.nativeElement;

    if (!img) {
      this.index.update((i) => (i + direction + total) % total);
      this.confirmed.set(false);
      return;
    }

    const nextIndex = (this.index() + direction + total) % total;
    const nextSrc = this.options()[nextIndex].image;

    /* kills every tween on this element, not just this.tween — a stray
       fade-in gsap.to() from a PREVIOUS browse() (started below, after
       its own preload() resolved) is a separate tween object never
       tracked by this.tween, and would otherwise keep running alongside
       this new slide-out if the player swipes again quickly */
    gsap.killTweensOf(img);
    this.tween = gsap.timeline();
    this.tween
      .to(img, {
        xPercent: -direction * 100,
        opacity: 0,
        duration: 0.16,
        ease: 'power1.in',
      })
      .call(() => {
        this.index.set(nextIndex);
        this.confirmed.set(false);
        this.popCounter();
        this.popDot(nextIndex);
      })
      .set(img, { xPercent: direction * 100 })
      .call(() => {
        this.preload(nextSrc).then(() => {
          /* stale guard — if the player swiped again while this was
             loading, a later browse() call already owns the element
             (and already killed this tween's own pending state above);
             animating here too would fight it over the same properties */
          if (this.index() !== nextIndex) return;
          gsap.to(img, {
            xPercent: 0,
            opacity: 1,
            duration: 0.22,
            ease: 'power2.out',
          });
        });
      });
  }

  /** quick scale-overshoot on the "N/4" text the instant it changes —
   *  both this and popDot() below fire from the same .call() in
   *  browse(), right when the index actually flips, not tied to a CSS
   *  state (a CSS transition on transform would replay on every
   *  reactive recalc, not just this one moment) */
  private popCounter(): void {
    const el = this.counterText()?.nativeElement;
    if (!el) return;
    gsap.fromTo(
      el,
      { scale: 1.35 },
      { scale: 1, duration: 0.3, ease: 'back.out(3)' },
    );
  }

  /** same idea, on whichever dot just became active — the CSS above
   *  handles its own color/opacity settling in, this is just the extra
   *  bounce on top.
   *
   *  This dot sits exactly on top of one of phone-frame.webp's own baked
   *  white circle cutouts (see &__dot in the .scss) — its CSS size is
   *  tuned to fully cover that hole, nothing more. The very first version
   *  here was gsap.fromTo(el, {scale:1.8}, {scale:1, ease:'back.out(3)'}),
   *  which was the actual bug reported: back.out OVERSHOOTS past its
   *  target on the way down from 1.8 to 1, meaning the dot briefly
   *  shrank to something like 0.85 mid-bounce before settling — smaller
   *  than the hole it's supposed to cover, so the white behind it peeked
   *  through for a frame or two. Growing UP from 1 to a peak and back
   *  down to EXACTLY 1 (never past it) pops just as visibly without ever
   *  going smaller than the size that was already covering the hole. */
  private popDot(index: number): void {
    const el = this.dotEls()[index]?.nativeElement;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap
      .timeline()
      .set(el, { scale: 1 })
      .to(el, { scale: 1.5, duration: 0.15, ease: 'power2.out' })
      .to(el, { scale: 1, duration: 0.2, ease: 'power2.out' });
  }
}
