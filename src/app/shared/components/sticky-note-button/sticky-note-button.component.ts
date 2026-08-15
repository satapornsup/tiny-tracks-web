import { Component, input, output } from '@angular/core';

export type StickyNoteButtonVariant = 'green' | 'pink';
export type StickyNoteButtonIconPosition = 'before' | 'after';

@Component({
  selector: 'app-sticky-note-button',
  standalone: true,
  templateUrl: './sticky-note-button.component.html',
  styleUrl: './sticky-note-button.component.scss',
})
export class StickyNoteButtonComponent {
  readonly label = input.required<string>();
  readonly variant = input<StickyNoteButtonVariant>('green');
  /** no icon asset exists yet — pass this once a caller projects one in */
  readonly iconPosition = input<StickyNoteButtonIconPosition>();
  readonly pressed = output<void>();
}
