import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StickyNoteButtonComponent } from '../../shared/components/sticky-note-button/sticky-note-button.component';
import { QuestionId, QuizStateService } from '../../shared/services/quiz-state.service';

interface ResultRow {
  id: QuestionId;
  label: string;
}

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

  isCorrect(id: QuestionId): boolean {
    return this.quizState.getAnswer(id)?.isCorrect ?? false;
  }
}
