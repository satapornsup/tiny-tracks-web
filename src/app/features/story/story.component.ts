import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StickyNoteButtonComponent } from '../../shared/components/sticky-note-button/sticky-note-button.component';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [HeaderComponent, StickyNoteButtonComponent],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss',
})
export class StoryComponent {
  private readonly router = inject(Router);

  skipClip(): void {
    this.router.navigate(['/home']);
  }
}
