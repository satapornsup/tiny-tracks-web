import { Component, inject, input } from "@angular/core";
import { MenuDrawerService } from "../../services/menu-drawer.service";

@Component({
  selector: "app-header",
  standalone: true,
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent {
  readonly bare = input(false);
  /** center label — omit (leave "") on pages that don't need one */
  readonly pageLabel = input("");
  /** set true when projecting an icon in alongside pageLabel; some pages
   *  only need text (e.g. "เนื้อเรื่อง"), so the icon slot isn't assumed */
  readonly hasIcon = input(false);
  protected readonly menuDrawer = inject(MenuDrawerService);
}
