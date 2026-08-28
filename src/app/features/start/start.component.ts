import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';

/** every one of &__decor's own floating desk pieces (see the .scss),
 *  the full set — id-card/note/shirt were left out at first over a
 *  concern they'd read as chunky, but at trail size (the same small
 *  22-36px range as every other piece, see spawnTrail below) they're
 *  just as light as the rest regardless of how big they are sitting
 *  still on the desk */
const TRAIL_SRCS = [
  'assets/images/start/decor/id-card.webp',
  'assets/images/start/decor/paperclip.webp',
  'assets/images/start/decor/pencil.webp',
  'assets/images/start/decor/coffee-cup.webp',
  'assets/images/start/decor/eraser.webp',
  'assets/images/start/decor/note.webp',
  'assets/images/start/decor/shirt.webp',
];

/** min ms between spawns — mousemove fires far more often than this
 *  while actually moving, so it's a real throttle; it naturally stops
 *  entirely the instant the cursor stops (no interval/rAF loop needed,
 *  no trail spawns while sitting still) */
const SPAWN_INTERVAL_MS = 90;
const TRAIL_LIFETIME_MS = 900;

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [HeaderComponent, RouterLink],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss',
})
export class StartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stage', { static: true }) private readonly stage!: ElementRef<HTMLElement>;
  private readonly zone = inject(NgZone);

  private lastSpawn = 0;
  private onMouseMove?: (event: MouseEvent) => void;

  /** mouse-only, desktop-only — same (hover: hover) and (pointer: fine)
   *  gate MenuDrawerService already uses, since a trail that "follows
   *  the cursor" has no touch equivalent at all (no hover-capable
   *  pointer to follow) rather than just degrading gracefully. Skipped
   *  under reduced-motion too, same as every other idle animation on
   *  this page. */
  ngAfterViewInit(): void {
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || reduceMotion) return;

    /* runs outside Angular's zone — this fires on every raw mousemove,
       and none of it touches component state Angular needs to react to
       (spawned elements are plain DOM nodes, not template-bound), so
       there's nothing here worth a change-detection pass */
    this.zone.runOutsideAngular(() => {
      this.onMouseMove = (event: MouseEvent) => this.handleMouseMove(event);
      this.stage.nativeElement.addEventListener('mousemove', this.onMouseMove);
    });
  }

  ngOnDestroy(): void {
    if (this.onMouseMove) {
      this.stage?.nativeElement.removeEventListener('mousemove', this.onMouseMove);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    const now = performance.now();
    if (now - this.lastSpawn < SPAWN_INTERVAL_MS) return;
    this.lastSpawn = now;

    const rect = this.stage.nativeElement.getBoundingClientRect();
    this.spawnTrail(event.clientX - rect.left, event.clientY - rect.top);
  }

  /** a plain <img>, created/removed straight on the DOM — not an Angular
   *  view (no *ngFor list to keep in sync, no structural directive
   *  overhead) since these come and go many times a second while the
   *  mouse is moving and are gone again within under a second.
   *
   *  Every layout-critical property is set INLINE here rather than via
   *  the &__trail class in the .scss — Angular's emulated view
   *  encapsulation works by suffixing every scoped selector AND every
   *  template-rendered element with a matching generated attribute
   *  ([_ngcontent-xxx]); an element created with plain
   *  document.createElement() never gets that attribute stamped on it,
   *  so &__trail[_ngcontent-xxx] simply never matches it. The visible
   *  bug was every spawned image landing unstyled as a normal flex
   *  child of .start (itself display:flex), stacking in a column right
   *  under the START button instead of being position:absolute at the
   *  cursor. The keyframes are the one exception that still reaches
   *  it — @keyframes names aren't attribute-scoped by emulated
   *  encapsulation, only selectors are, so referencing one by name from
   *  an inline `animation` still resolves to the one in the .scss. */
  private spawnTrail(x: number, y: number): void {
    const src = TRAIL_SRCS[Math.floor(Math.random() * TRAIL_SRCS.length)];
    const size = 34 + Math.random() * 18;
    const rot = Math.random() * 50 - 25;

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.position = 'absolute';
    img.style.zIndex = '5';
    img.style.pointerEvents = 'none';
    img.style.width = `${size}px`;
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.setProperty('--trail-rot', `${rot}deg`);
    img.style.animation = 'start-trail-fade 0.9s ease-out forwards';

    this.stage.nativeElement.appendChild(img);
    setTimeout(() => img.remove(), TRAIL_LIFETIME_MS);
  }
}
