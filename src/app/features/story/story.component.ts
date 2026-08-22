import { Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss',
})
export class StoryComponent {
  private readonly router = inject(Router);
  private readonly clip = viewChild<ElementRef<HTMLVideoElement>>('clip');

  constructor() {
    /* on top of the eager pause in skipClip() below — this is the actual
     * final cleanup once the component is really destroyed. Confirmed via
     * a manual marker-element test that Angular always creates a genuinely
     * fresh <video> on re-entering /story (forward nav, and browser
     * back/forward too — no bfcache reuse of a stale instance here, unlike
     * the menu-drawer bug), so a leftover/duplicate element was ruled out.
     * pause() alone stops audio immediately and reliably — the extra
     * removeAttribute+load() below isn't needed for silencing it, it's
     * just the MDN-recommended way to fully release the underlying media
     * resource/network connection instead of leaving it idle-but-loaded. */
    inject(DestroyRef).onDestroy(() => {
      const video = this.clip()?.nativeElement;
      if (!video) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
  }

  skipClip(): void {
    /* pause the instant the user clicks — not just on eventual destroy.
     * pageTransitionGuard (see routes) holds navigation open for ~0.2-0.4s
     * to play the exit fade before this component is actually torn down,
     * and without this, the clip keeps playing (audibly) for that whole
     * crossfade window, which sounds like it's "overlapping" whatever
     * loads next rather than stopping when Skip was pressed. */
    this.clip()?.nativeElement.pause();
    this.router.navigate(['/home']);
  }
}
