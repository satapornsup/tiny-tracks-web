import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuDrawerComponent } from './shared/components/menu-drawer/menu-drawer.component';
import { MenuDrawerService } from './shared/services/menu-drawer.service';
import { PageTransitionService } from './shared/services/page-transition.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuDrawerComponent],
  template: `
    <div class="page-outlet" #outlet>
      <router-outlet />
    </div>
    @if (showMenuDrawer()) {
    <app-menu-drawer />
    }
  `
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly pageTransition = inject(PageTransitionService);
  private readonly menuDrawer = inject(MenuDrawerService);
  private readonly outletRef = viewChild.required<ElementRef<HTMLElement>>('outlet');

  /** Start ('/') has no hamburger and no menu access at all (CLAUDE.md
   *  §2.1) — the drawer must not exist in the DOM there at all, not just
   *  be visually closed, because it's globally mounted with its own
   *  edge-hover-to-open affordance that works with no button to trigger
   *  it: hovering near the right edge on Start could still slide it in */
  readonly showMenuDrawer = signal(this.router.url !== '/');

  constructor() {
    afterNextRender(() => this.pageTransition.registerOutlet(this.outletRef().nativeElement));

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.pageTransition.fadeIn();
      const onStart = (event as NavigationEnd).urlAfterRedirects === '/';
      this.showMenuDrawer.set(!onStart);
      if (onStart) {
        this.menuDrawer.close();
      }
    });
  }
}
