import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuDrawerComponent } from './shared/components/menu-drawer/menu-drawer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuDrawerComponent],
  template: `
    <router-outlet />
    <app-menu-drawer />
  `
})
export class AppComponent {}
