import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-zoom-overlay',
  standalone: true,
  templateUrl: './zoom-overlay.component.html',
  styleUrl: './zoom-overlay.component.scss',
})
export class ZoomOverlayComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly imageSrc = input('');
  readonly imageAlt = input('');
  readonly closed = output<void>();
}
