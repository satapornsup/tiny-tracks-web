import { Component, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuDrawerComponent } from './shared/components/menu-drawer/menu-drawer.component';
import { PageTransitionService } from './shared/services/page-transition.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuDrawerComponent],
  template: `
    <div class="page-outlet" #outlet>
      <router-outlet />
    </div>
    <app-menu-drawer />
  `
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly pageTransition = inject(PageTransitionService);
  private readonly outletRef = viewChild.required<ElementRef<HTMLElement>>('outlet');

  constructor() {
    afterNextRender(() => this.pageTransition.registerOutlet(this.outletRef().nativeElement));

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.pageTransition.fadeIn();
    });
  }
}
