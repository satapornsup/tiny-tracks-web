import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import gsap from 'gsap';
import { ConfirmCheckboxComponent } from '../../../shared/components/confirm-checkbox/confirm-checkbox.component';

interface EyeConfig {
  socketImg: string;
  top: string;
  left: string;
  width: string;
  eyePupil: EyePupilConfig;
}

interface EyePupilConfig {
  top: string;
  left: string;
  width: string;
}

/** a face can carry 1 eye (the two tilted profile faces, each cropped by
 *  the screen edge so only their near eye shows) or 2 (the front-facing
 *  face — a single head with both its own eyes, NOT two separate heads
 *  side by side, per the reference mockup) */
interface FaceConfig {
  id: string;
  faceImg: string;
  position: 'left' | 'mid' | 'right';
  eyes: readonly EyeConfig[];
  /** this face's first eye's index into the flat pupilOffsets array
   *  (DOM order: left's 1 eye = index 0, mid's 2 eyes = 1–2, right's 1
   *  eye = 3) — hand-computed since the eye counts per face are fixed,
   *  not derived, so the template can index pupilOffsets() without
   *  needing to track a running counter across nested @for loops itself */
  eyeStartIndex: number;
}

@Component({
  selector: 'app-question-curtain',
  standalone: true,
  imports: [ConfirmCheckboxComponent],
  templateUrl: './question-curtain.component.html',
  styleUrl: './question-curtain.component.scss',
})
export class QuestionCurtainComponent implements OnInit, OnDestroy {
  /** whether the curtain was already closed last time (Back keeps state
   *  per CLAUDE.md §7) — read in ngOnInit, not the constructor, same
   *  input-timing rule every other question widget follows. null on a
   *  genuinely first visit; recordAnswer only ever runs from onNext,
   *  which requires confirmed to already be true, so a non-null value
   *  here also means "was confirmed" (same inference swipe-card/work-
   *  clock make from their own initial-value inputs). */
  readonly initialClosed = input<boolean | null>(null);

  readonly curtainClosed = signal(false);
  readonly confirmed = signal(false);

  /** correct = curtain fully closed before confirming; left open (even
   *  partway through its slide animation) counts as wrong */
  readonly isCorrect = computed(() => this.curtainClosed());

  /* position is which side of the screen the face SITS, not which way it
     tilts — a face tilted toward its own left (face-tilt-left.webp) reads
     as "looking rightward/inward" when placed on the right edge, and
     vice versa, so the tilt art and screen side are deliberately crossed
     (confirmed against the reference: both profile faces lean IN toward
     the character in the middle, not out toward the screen edge) */
  readonly faces: readonly FaceConfig[] = [
    {
      id: 'left',
      faceImg: 'assets/images/question/curtain/face-tilt-right.webp',
      position: 'left',
      eyes: [
        {
          socketImg: 'assets/images/question/curtain/eye-socket-front-a.webp',
          top: '38%',
          left: '70%',
          width: '20%',
          eyePupil: {
            top: '35%',
            left: '42%',
            width: '35%',
          },
        },
      ],
      eyeStartIndex: 0,
    },
    {
      id: 'mid',
      faceImg: 'assets/images/question/curtain/face-front.webp',
      position: 'mid',
      eyes: [
        {
          socketImg: 'assets/images/question/curtain/eye-socket-tilt-a.webp',
          top: '34%',
          left: '17%',
          width: '24%',
          eyePupil: {
            top: '33%',
            left: '28%',
            width: '35%',
          },
        },
        {
          socketImg: 'assets/images/question/curtain/eye-socket-tilt-b.webp',
          top: '34%',
          left: '57%',
          width: '24%',
          eyePupil: {
            top: '33%',
            left: '28%',
            width: '35%',
          },
        },
      ],
      eyeStartIndex: 1,
    },
    {
      id: 'right',
      faceImg: 'assets/images/question/curtain/face-tilt-left.webp',
      position: 'right',
      eyes: [
        {
          socketImg: 'assets/images/question/curtain/eye-socket-front-b.webp',
          top: '38%',
          left: '10%',
          width: '20%',
          eyePupil: {
            top: '35%',
            left: '23%',
            width: '35%',
          },
        },
      ],
      eyeStartIndex: 3,
    },
  ];

  /** flattened 1:1 with every `#eyeSocket` the template renders (in DOM
   *  order: left's 1 eye, mid's 2 eyes, right's 1 eye) — used only to
   *  size the initial pupilOffsets array to the right length */
  private readonly totalEyeCount = this.faces.reduce(
    (sum, f) => sum + f.eyes.length,
    0,
  );

  /* one pupil <img> per eye socket (see &__eye in the template) —
     positions are cached on view init / resize instead of re-measured on
     every mousemove (getBoundingClientRect forces a layout reflow, and
     mousemove can fire dozens of times a second) */
  private readonly eyeSockets =
    viewChildren<ElementRef<HTMLElement>>('eyeSocket');
  private eyeCenters: { x: number; y: number; maxRadius: number }[] = [];
  readonly pupilOffsets = signal<{ x: number; y: number }[]>(
    Array.from({ length: this.totalEyeCount }, () => ({ x: 0, y: 0 })),
  );

  private readonly character = viewChild<ElementRef<HTMLElement>>('character');
  readonly characterOffset = signal({ x: 0, y: 0 });
  /** pauses the idle wiggle (see &__character-img's animation) while
   *  actively dragging — the wiggle's own CSS rotate() lives on a
   *  DIFFERENT element than this drag translate() specifically so the
   *  two never fight over the same `transform` (an animation's transform
   *  otherwise wins the cascade over a plain inline style, which would
   *  have fought the drag position every frame), but even so, wiggling
   *  underneath a hand that's mid-drag would just look glitchy */
  readonly dragging = signal(false);
  private dragPointerStart: { x: number; y: number } | null = null;
  private dragOffsetStart = { x: 0, y: 0 };
  private springTween: gsap.core.Tween | null = null;

  ngOnInit(): void {
    const restored = this.initialClosed();
    if (restored !== null) {
      this.curtainClosed.set(restored);
      this.confirmed.set(true);
    }
    // measure once the eye sockets have actually rendered
    queueMicrotask(() => this.measureEyeCenters());
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('pointermove', this.onDocPointerMove);
    document.removeEventListener('pointerup', this.onDocPointerUp);
    this.springTween?.kill();
  }

  private readonly onResize = (): void => this.measureEyeCenters();

  private measureEyeCenters(): void {
    this.eyeCenters = this.eyeSockets().map((el) => {
      const rect = el.nativeElement.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        /* &__eye's own box is a square that also has to fit the eyebrow
           art baked into the same eye-socket image above the white of
           the eye — the visible sclera isn't centered in (or as wide as)
           this whole box, so a radius based on the box's FULL width let
           the pupil's center wander far enough that its own rendered
           edge visibly crossed outside the white and onto the skin/brow
           art, worse on some eyes than others depending on how far off-
           center their particular sclera sits within the shared square
           layout. 0.14 (tried first) was too generous; 0.07 keeps the
           pupil safely inside on every eye at the current face size. */
        maxRadius: rect.width * 0.07,
      };
    });
  }

  /* .at() (not bracket indexing) so its TS return type is `T | undefined`
     regardless of tsconfig's noUncheckedIndexedAccess setting — plain
     `pupilOffsets()[i]` types as always-defined here, which made the
     template's `?.` fallback a no-op per the type checker (NG8107) even
     though the array genuinely can be shorter than expected mid-render */
  pupilTransform(index: number): string {
    const offset = this.pupilOffsets().at(index) ?? { x: 0, y: 0 };
    return `translate(${offset.x}px, ${offset.y}px)`;
  }

  onStagePointerMove(event: PointerEvent): void {
    this.pupilOffsets.set(
      this.eyeCenters.map(({ x, y, maxRadius }) => {
        const dx = event.clientX - x;
        const dy = event.clientY - y;
        const dist = Math.hypot(dx, dy);
        if (dist <= maxRadius || dist === 0) return { x: dx, y: dy };
        const scale = maxRadius / dist;
        return { x: dx * scale, y: dy * scale };
      }),
    );
  }

  toggleCurtain(): void {
    this.curtainClosed.update((v) => !v);
    // same "changing the answer un-confirms it" rule as work-clock's switches
    this.confirmed.set(false);
  }

  onCharacterPointerDown(event: PointerEvent): void {
    event.preventDefault();
    this.springTween?.kill();
    this.dragging.set(true);
    this.dragPointerStart = { x: event.clientX, y: event.clientY };
    this.dragOffsetStart = { ...this.characterOffset() };
    this.character()?.nativeElement.setPointerCapture(event.pointerId);
    document.addEventListener('pointermove', this.onDocPointerMove);
    document.addEventListener('pointerup', this.onDocPointerUp);
  }

  private readonly onDocPointerMove = (event: PointerEvent): void => {
    if (!this.dragPointerStart) return;
    this.characterOffset.set({
      x: this.dragOffsetStart.x + (event.clientX - this.dragPointerStart.x),
      y: this.dragOffsetStart.y + (event.clientY - this.dragPointerStart.y),
    });
  };

  /* releasing anywhere springs the character back to its seated spot —
     a plain object (not the signal) is what GSAP tweens frame-by-frame,
     with onUpdate pushing each intermediate value into the signal so the
     template's translate() stays in sync throughout the animation */
  private readonly onDocPointerUp = (): void => {
    this.dragPointerStart = null;
    this.dragging.set(false);
    document.removeEventListener('pointermove', this.onDocPointerMove);
    document.removeEventListener('pointerup', this.onDocPointerUp);

    const current = { ...this.characterOffset() };
    this.springTween = gsap.to(current, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.5)',
      onUpdate: () => this.characterOffset.set({ x: current.x, y: current.y }),
    });
  };
}
