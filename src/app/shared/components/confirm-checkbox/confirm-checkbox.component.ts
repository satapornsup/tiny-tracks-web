import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-checkbox',
  standalone: true,
  templateUrl: './confirm-checkbox.component.html',
  styleUrl: './confirm-checkbox.component.scss',
})
export class ConfirmCheckboxComponent {
  readonly checked = input(false);
  readonly label = input('ยืนยัน');
  readonly checkedChange = output<boolean>();

  toggle(): void {
    this.checkedChange.emit(!this.checked());
  }
}
