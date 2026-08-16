import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-safety-tips',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './safety-tips.component.html',
  styleUrl: './safety-tips.component.scss',
})
export class SafetyTipsComponent {}
