import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StickyNoteButtonComponent } from '../../shared/components/sticky-note-button/sticky-note-button.component';

export type SafetyItemId = 1 | 2 | 3 | 4 | 5;

interface SafetyItem {
  id: SafetyItemId;
  /** every item is now hand-built the same way item 2 always was — a
   *  plain, content-free folder background (no baked-in "0N" tag, no
   *  DO/DON'T text) with real DOM text + separate illustration pieces
   *  laid on top in the template (@switch (item.id), see the .html).
   *  The flattened aข้อ-3X.webp exports (used as a single <img> per
   *  item, card-N.webp) are retired — none of their text was real DOM
   *  text, which is exactly what this change was for. */
  bgImage: string;
  /** how far (px) this item's idle sliver pokes above the cover — hand-
   *  tuned per item (not a generic i*step formula) so each one clears
   *  the item in front of it by a comfortable, easy-to-read amount once
   *  &__item's own scale shrinks it (a smaller box needs a bigger offset
   *  to still poke out by the same visual amount, since scale shrinks
   *  toward transform-origin: bottom center) */
  peek: number;
  /** idle-only size, 1 = full size — items further back are slightly
   *  smaller, reading as "receding into the stack" WITHOUT rotating
   *  them (rotation was tried first; it also made the number label
   *  drift far enough under rotation to get hidden behind the item in
   *  front, a real bug seen earlier). Reset to 1 (full size) the moment
   *  an item is active/risen, same as its own rotation used to be. */
  scale: number;
}

@Component({
  selector: 'app-safety-tips',
  standalone: true,
  imports: [HeaderComponent, StickyNoteButtonComponent, RouterLink],
  templateUrl: './safety-tips.component.html',
  styleUrl: './safety-tips.component.scss',
})
export class SafetyTipsComponent implements AfterViewInit, OnDestroy {
  /* DOM order here is itemsBackToFront (5,4,3,2,1 — see below), so this
     query list naturally lists item 5 first and item 1 last, which is
     exactly the stagger order the entrance below wants: the back of the
     stack settles first, the front (closest) one lands last and draws
     the eye. */
  @ViewChildren('itemEl') private readonly itemEls!: QueryList<ElementRef<HTMLDivElement>>;
  /** used only by the document-level outside-click listener below, to
   *  tell "outside the folder stack" apart from "inside it" */
  @ViewChild('stage') private readonly stage!: ElementRef<HTMLDivElement>;
  private entranceTween?: gsap.core.Tween;


  /** stacking order front-to-back, plain sequential 1→5 (no more
   *  interleaved order) — index 0 sits closest to the cover/viewer
   *  (biggest, peeks the least), the last item sits furthest back
   *  (smallest, peeks the most). The template derives each tab's
   *  z-index straight from this array order. */
  /* peek/scale aren't independent — transform-origin:bottom means a
     smaller scale pulls an item's TOP edge down too (toward the fixed
     bottom pivot), quietly eating into whatever peek gain its bigger
     `bottom` offset was supposed to buy it. First pass used peek steps
     of ~24px with a 0.04 scale step and item 2 ended up with only an
     ~11px real sliver (barely readable, "hidden") once the scale
     shrink was netted out. These numbers give every item a real, even
     ~28-30px visible sliver — see the .ts's own git history for the
     worked-out math if these ever need re-tuning.

     All 5 got a flat +24px bump on top of that once &__cover itself
     grew (transform:scale(1.05), see the .scss) to read as the biggest
     folder in the stack — &__cover's real height grew right along with
     it, and item 1's old 18px peek was smaller than that growth alone,
     so the taller cover started swallowing its sliver whole. */
  readonly items: readonly SafetyItem[] = [
    { id: 1, bgImage: 'assets/images/safety/bg-1.webp', peek: 42, scale: 1 },
    { id: 2, bgImage: 'assets/images/safety/item2-bg.webp', peek: 72, scale: 0.98 },
    { id: 3, bgImage: 'assets/images/safety/bg-3.webp', peek: 102, scale: 0.96 },
    { id: 4, bgImage: 'assets/images/safety/bg-4.webp', peek: 132, scale: 0.94 },
    { id: 5, bgImage: 'assets/images/safety/bg-5.webp', peek: 162, scale: 0.92 },
  ];

  /** same 5 items, back-to-front DOM order — every item shares one flat
   *  height (--card-h) and differs only by a small `bottom` offset, so
   *  their boxes overlap almost entirely (the offsets are tens of px on
   *  a card several hundred px tall); with no per-item z-index at all
   *  (see &__item in the .scss — &__cover is now the ONLY explicit
   *  z-index on this stage), ties go to whichever is LATER in the DOM,
   *  so item 5 has to render first and item 1 last for item 1 to still
   *  win clicks/paint over the rest, matching how a real stack of
   *  folders reads (the front-most one is on top and grabs the tap). */
  readonly itemsBackToFront: readonly SafetyItem[] = [...this.items].reverse();

  /** click/tap ONLY — hover was tried first and had a real bug: the
   *  instant a card rose on hover, the cursor was no longer over the
   *  (now-moved) tab, firing mouseleave, which dropped the card again,
   *  which put the tab back under the cursor, firing mouseenter again
   *  — a rapid open/close flicker loop. A plain click toggle has no
   *  such feedback loop, and works identically on touch. */
  readonly activeId = signal<SafetyItemId | null>(null);

  toggle(id: SafetyItemId): void {
    this.activeId.update((current) => (current === id ? null : id));
  }

  /** the tab is the only thing that OPENS a card — stopPropagation so
   *  this click doesn't also bubble up into &__item's own onPanelClick
   *  below, which would immediately re-close whatever this just opened
   *  (both handlers firing off the same physical click otherwise) */
  onTabClick(event: MouseEvent, id: SafetyItemId): void {
    event.stopPropagation();
    this.toggle(id);
  }

  /** CLOSING is more lenient than opening, per a follow-up request:
   *  clicking anywhere on an already-open card's own body now closes it
   *  too (not just its tab) — but only if it's actually the currently
   *  active one; clicking an idle item's own (mostly hidden) panel does
   *  nothing, since opening still only happens via the tab. */
  onPanelClick(id: SafetyItemId): void {
    if (this.activeId() === id) this.close();
  }

  close(): void {
    this.activeId.set(null);
  }

  /** one-time entrance cascade — every idle item rises from flush-hidden
   *  (bottom:0, behind &__cover, same as the click-driven rise) up to its
   *  own real idle `peek` in back-to-front order, so the stack reads as
   *  being built up card by card instead of just appearing fully formed.
   *  gsap.from() reads each element's CURRENT (Angular-rendered) bottom
   *  as the animation's end value, so it doesn't need to know each
   *  item's own peek number — only the shared starting point (0) does. */
  ngAfterViewInit(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const elements = this.itemEls.toArray().map((ref) => ref.nativeElement);
    /* &__item's own CSS `transition: bottom …` (for the click-driven
       rise/fall) would otherwise fight GSAP's per-frame inline-style
       writes here, each one racing the CSS transition toward a stale
       target — turned off for the entrance only, restored once it ends
       so clicking an item afterward still gets its normal CSS glide. */
    gsap.set(elements, { transition: 'none' });
    this.entranceTween = gsap.from(elements, {
      bottom: 0,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.6)',
      stagger: 0.1,
      onComplete: () => {
        for (const el of elements) el.style.transition = '';
      },
    });

    document.addEventListener('pointerdown', this.onDocPointerDown);
  }

  ngOnDestroy(): void {
    this.entranceTween?.kill();
    document.removeEventListener('pointerdown', this.onDocPointerDown);
  }

  /** other half of "closing is lenient" (see onPanelClick above) — a
   *  click anywhere outside the whole folder stack also closes whatever
   *  card is currently open. pointerdown (not click) so this fires
   *  before &__item-tab's own click further down if someone clicks a
   *  DIFFERENT item's tab while one is already open — that tab's own
   *  toggle() then runs on the resulting click as normal, opening the
   *  new one right after this closes the old one. */
  private readonly onDocPointerDown = (event: PointerEvent): void => {
    if (this.activeId() === null) return;
    const stageEl = this.stage?.nativeElement;
    if (stageEl && event.target instanceof Node && !stageEl.contains(event.target)) {
      this.close();
    }
  };
}
