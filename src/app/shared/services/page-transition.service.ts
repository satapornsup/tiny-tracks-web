import { Injectable } from '@angular/core';
import gsap from 'gsap';

@Injectable({ providedIn: 'root' })
export class PageTransitionService {
  private outletEl: HTMLElement | null = null;

  /** called once by AppComponent — the single wrapper both fade
   *  animations act on, so every route gets the same cross-fade for free
   *  without any per-page code */
  registerOutlet(el: HTMLElement): void {
    this.outletEl = el;
  }

  fadeOut(): Promise<void> {
    if (!this.outletEl) return Promise.resolve();
    const tweenDone = new Promise<void>((resolve) => {
      gsap.to(this.outletEl, {
        opacity: 0,
        duration: 0.22,
        ease: 'power1.out',
        onComplete: () => resolve(),
      });
    });
    /* gsap's ticker runs on requestAnimationFrame, which browsers throttle
       in backgrounded/inactive tabs — if a user switches away mid-fade,
       onComplete may never fire and this guard would block navigation
       forever. A hard timeout guarantees navigation always proceeds. */
    const timeoutFallback = new Promise<void>((resolve) => setTimeout(resolve, 400));
    return Promise.race([tweenDone, timeoutFallback]);
  }

  fadeIn(): void {
    if (!this.outletEl) return;
    gsap.fromTo(this.outletEl, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power1.out' });
  }
}
