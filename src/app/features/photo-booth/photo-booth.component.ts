import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StickyNoteButtonComponent } from '../../shared/components/sticky-note-button/sticky-note-button.component';

@Component({
  selector: 'app-photo-booth',
  standalone: true,
  imports: [HeaderComponent, StickyNoteButtonComponent, RouterLink],
  templateUrl: './photo-booth.component.html',
  styleUrl: './photo-booth.component.scss',
})
export class PhotoBoothComponent {}
