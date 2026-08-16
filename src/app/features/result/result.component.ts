import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StickyNoteButtonComponent } from '../../shared/components/sticky-note-button/sticky-note-button.component';
import { QuestionId, QuizStateService } from '../../shared/services/quiz-state.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [HeaderComponent, StickyNoteButtonComponent, RouterLink],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss',
})
export class ResultComponent {
  private readonly quizState = inject(QuizStateService);

  readonly questionIds: QuestionId[] = [1, 2, 3, 4, 5, 6];

  answerFor(id: QuestionId) {
    return this.quizState.getAnswer(id);
  }
}
