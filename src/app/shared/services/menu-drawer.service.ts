import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuDrawerService {
  readonly isOpen = signal(false);

  /** true only on devices with a real pointer that can hover (mouse/trackpad) — not touch */
  readonly supportsHover =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  private closeTimer: ReturnType<typeof setTimeout> | null = null;

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
