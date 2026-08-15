import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StickyNoteButtonComponent } from '../../shared/components/sticky-note-button/sticky-note-button.component';
import { ZoomOverlayComponent } from '../../shared/components/zoom-overlay/zoom-overlay.component';

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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, StickyNoteButtonComponent, RouterLink, ZoomOverlayComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly zoomTarget = signal<ZoomTarget | null>(null);
  readonly zoomOpen = signal(false);

  /* keeps showing the last-picked content while the overlay's own CSS
     transition plays it out, instead of blanking mid-animation */
  readonly zoomContent = computed(() => {
    const target = this.zoomTarget();
    return target ? ZOOM_CONTENT[target] : null;
  });

  openZoom(target: ZoomTarget): void {
    this.zoomTarget.set(target);
    this.zoomOpen.set(true);
  }

  closeZoom(): void {
    this.zoomOpen.set(false);
  }

  readContract(): void {
    // next destination (question flow) isn't built yet
  }
}
