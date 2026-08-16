import { Injectable, inject, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MenuDrawerService {
  readonly isOpen = signal(false);

  /** true only on devices with a real pointer that can hover (mouse/trackpad) — not touch */
  readonly supportsHover =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    /* the drawer is a single global instance (rendered once in
       AppComponent, outside <router-outlet>) and this service is a root
       singleton — its open state otherwise survives navigation that
       doesn't go through one of the drawer's own links (guards
       redirecting elsewhere, programmatic navigation), so it can
       reappear on a page whose header doesn't even have a hamburger */
    inject(Router)
      .events.pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => this.close());

    /* real browser back/forward usually restores the page from bfcache
       instead of re-running the app — Angular's Router never fires for
       that (no NavigationStart), so the drawer's in-memory isOpen would
       otherwise survive frozen exactly as it was when the tab was left */
    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', () => this.close());
    }
  }

  open(): void {
    this.cancelPendingClose();
    this.isOpen.set(true);
  }

  close(): void {
    this.cancelPendingClose();
    this.isOpen.set(false);
  }

  toggle(): void {
    this.cancelPendingClose();
    this.isOpen.update((value) => !value);
  }

  /** hover intent from mouseenter — no-op on touch devices */
  onHoverEnter(): void {
    if (!this.supportsHover) return;
    this.open();
  }

  /** hover intent from mouseleave — closes after a short delay so moving
   *  from the button to the drawer itself doesn't flicker closed */
  onHoverLeave(): void {
    if (!this.supportsHover) return;
    this.cancelPendingClose();
    this.closeTimer = setTimeout(() => this.isOpen.set(false), 200);
  }

  private cancelPendingClose(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
