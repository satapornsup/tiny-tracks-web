import { Component, computed, input, output } from '@angular/core';

export type StickyNoteButtonVariant = 'green' | 'pink';
export type StickyNoteButtonIconPosition = 'before' | 'after';

@Component({
  selector: 'app-sticky-note-button',
  standalone: true,
  templateUrl: './sticky-note-button.component.html',
  styleUrl: './sticky-note-button.component.scss',
})
export class StickyNoteButtonComponent {
  /** omit (or pass "") for an icon-only button — the pill shrinks to a
   *  small circle around just the icon instead of the wide oval */
  readonly label = input('');
  readonly variant = input<StickyNoteButtonVariant>('green');
  readonly iconPosition = input<StickyNoteButtonIconPosition>();
  readonly disabled = input(false);
  readonly pressed = output<void>();

  readonly isIconOnly = computed(() => this.label().length === 0);
  /** long labels (e.g. "อ่านข้อควรปฏิบัติ") need a wider pre-authored pill
   *  tier — stretching the normal one via CSS instead would either clip
   *  the label or need non-uniform scaling that ovalizes the dashed
   *  corners (see ConfirmCheckboxComponent for why that was ruled out) */
  readonly isWide = computed(() => this.label().length > 12);
}
