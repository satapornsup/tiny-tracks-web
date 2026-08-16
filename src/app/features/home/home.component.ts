import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StickyNoteButtonComponent } from '../../shared/components/sticky-note-button/sticky-note-button.component';
import { ZoomOverlayComponent } from '../../shared/components/zoom-overlay/zoom-overlay.component';
import { QuizStateService } from '../../shared/services/quiz-state.service';

type ZoomTarget = 'contract' | 'photo';

const ZOOM_CONTENT: Record<ZoomTarget, { title: string; src: string; alt: string }> = {
  contract: {
    title: 'สัญญา',
    src: 'assets/images/home/zoom/contract.webp',
    alt: 'สัญญาจ้างงาน Tiny Tracks Ent.',
  },
  photo: {
    title: 'ID CARD',
    src: 'assets/images/home/zoom/id-card.webp',
    alt: 'บัตรประจำตัวของมู่ลี่',
  },
};

const DESK_TEXT_LINES = [
  'มู่ลี่ เด็กหญิงหน้าตาน่ารักอายุ 5 ขวบ มีแววเป็นซุปเปอร์สตาร์',
  'กำลังเข้าเซ็นสัญญา จากค่าย Tiny Tracks ค่ายสื่อบันเทิงที่ปั้นดาราดังมากมาย',
  'แต่เนื่องจากที่มู่ลี่ยังอายุไม่ถึง คุณต้องรับบทเป็น ผู้ปกครองของมู่ลี่ เพื่อเซ็นสัญญาต่าง ๆ แทน...',
];

/* grapheme clusters, not raw characters — Thai vowels/tone marks combine
   with the base consonant (e.g. ่ ้ ั ำ), so slicing by string index can
   split a mark from its consonant mid-reveal and flash a stray glyph */
const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
const DESK_TEXT_GRAPHEMES = DESK_TEXT_LINES.map((line) =>
  Array.from(segmenter.segment(line), (s) => s.segment)
);
const DESK_TEXT_TOTAL = DESK_TEXT_GRAPHEMES.reduce((sum, g) => sum + g.length, 0);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, StickyNoteButtonComponent, RouterLink, ZoomOverlayComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly quizState = inject(QuizStateService);

  private readonly zoomTarget = signal<ZoomTarget | null>(null);
  readonly zoomOpen = signal(false);

  /* keeps showing the last-picked content while the overlay's own CSS
     transition plays it out, instead of blanking mid-animation */
  readonly zoomContent = computed(() => {
    const target = this.zoomTarget();
    return target ? ZOOM_CONTENT[target] : null;
  });

  private readonly revealedCount = signal(0);
  private typewriterTimer?: ReturnType<typeof setInterval>;

  readonly deskTextLines = computed(() => {
    let remaining = this.revealedCount();
    return DESK_TEXT_GRAPHEMES.map((graphemes) => {
      const take = Math.max(0, Math.min(remaining, graphemes.length));
      remaining -= take;
      return graphemes.slice(0, take).join('');
    });
  });

  readonly deskTextDone = computed(() => this.revealedCount() >= DESK_TEXT_TOTAL);

  /** which line the cursor should sit at the end of — the line still
   *  receiving characters, or the last one once typing has finished */
  readonly deskCursorLine = computed(() => {
    let remaining = this.revealedCount();
    for (let i = 0; i < DESK_TEXT_GRAPHEMES.length; i++) {
      if (remaining < DESK_TEXT_GRAPHEMES[i].length) return i;
      remaining -= DESK_TEXT_GRAPHEMES[i].length;
    }
    return DESK_TEXT_GRAPHEMES.length - 1;
  });

  ngOnInit(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      this.revealedCount.set(DESK_TEXT_TOTAL);
      return;
    }
    this.typewriterTimer = setInterval(() => {
      const next = this.revealedCount() + 1;
      this.revealedCount.set(next);
      if (next >= DESK_TEXT_TOTAL) {
        clearInterval(this.typewriterTimer);
      }
    }, 35);
  }

  ngOnDestroy(): void {
    clearInterval(this.typewriterTimer);
  }

  openZoom(target: ZoomTarget): void {
    this.zoomTarget.set(target);
    this.zoomOpen.set(true);
  }

  closeZoom(): void {
    this.zoomOpen.set(false);
  }

  readContract(): void {
    this.quizState.enterQuiz();
    this.router.navigate(['/question/1']);
  }
}
