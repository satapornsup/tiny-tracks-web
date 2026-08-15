import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuDrawerService } from '../../services/menu-drawer.service';

@Component({
  selector: 'app-menu-drawer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-drawer.component.html',
  styleUrl: './menu-drawer.component.scss',
})
export class MenuDrawerComponent {
  protected readonly menuDrawer = inject(MenuDrawerService);
}
