import { Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StickyNoteButtonComponent } from '../../shared/components/sticky-note-button/sticky-note-button.component';
import { QuestionId, QuizStateService } from '../../shared/services/quiz-state.service';

interface ResultRow {
  id: QuestionId;
  label: string;
}

type ResultPhase = 'clip' | 'recap';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [HeaderComponent, StickyNoteButtonComponent, RouterLink],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss',
})
export class ResultComponent {
  private readonly quizState = inject(QuizStateService);

  /** row copy matches the reference mockup (aสรุปผล-03/06.png) exactly —
   *  a short label for what each question was actually testing, not the
   *  question's own on-screen prompt text */
  readonly rows: readonly ResultRow[] = [
    { id: 1, label: 'การคัดกรองรูปภาพ' },
    { id: 2, label: 'สิทธิความเป็นส่วนตัวของเด็ก' },
    { id: 3, label: 'การจัดการเวลาการทำงาน' },
    { id: 4, label: 'การแต่งกายของเด็ก' },
    { id: 5, label: 'การให้ความเป็นส่วนตัวกับเด็ก' },
    { id: 6, label: 'การรับรู้ความเสี่ยงที่จะเกิดขึ้น' },
  ];

  /** every row green (aสรุปผล-06) vs at least one pink (aสรุปผล-03) — the
   *  mockup swaps which PHRASE gets the highlighted pill depending on
   *  this, not just the pill's color (see &__title-line in the template) */
  readonly allCorrect = computed(() => this.rows.every((row) => this.isCorrect(row.id)));

  /** clip-then-recap, same idea as StoryComponent's own clip step — a new
   *  request to show one of two short clips before the recap card is
   *  revealed, picked by allCorrect() so it matches whichever title/pill
   *  state the recap itself is about to show */
  readonly phase = signal<ResultPhase>('clip');
  readonly clipSrc = computed(() =>
    this.allCorrect() ? 'assets/videos/result/no-risk.mp4' : 'assets/videos/result/risk.mp4',
  );

  /** true for the CLOSING_MS window right before phase actually flips —
   *  toggles a CSS opacity transition on the clip/skip button (see
   *  &__clip.result__clip--closing in the .scss) so the cut to the recap
   *  card fades instead of snapping instantly, on both the natural
   *  (ended) end and a manual Skip */
  readonly closing = signal(false);
  private static readonly CLOSING_MS = 320;
  private closeTimeout?: ReturnType<typeof setTimeout>;

  private readonly clip = viewChild<ElementRef<HTMLVideoElement>>('clip');

  constructor() {
    // same cleanup as StoryComponent's clip — stop the media resource
    // outright on destroy instead of leaving it idle-but-loaded
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.closeTimeout);
      const video = this.clip()?.nativeElement;
      if (!video) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
  }

  skipClip(): void {
    this.clip()?.nativeElement.pause();
    this.beginClose();
  }

  onClipEnded(): void {
    this.beginClose();
  }

  private beginClose(): void {
    if (this.closing()) return; // (ended) + a fast double Skip click both landing is a no-op past the first
    this.closing.set(true);
    this.closeTimeout = setTimeout(() => this.phase.set('recap'), ResultComponent.CLOSING_MS);
  }

  isCorrect(id: QuestionId): boolean {
    return this.quizState.getAnswer(id)?.isCorrect ?? false;
  }
}
