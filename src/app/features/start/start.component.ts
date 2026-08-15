import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [HeaderComponent, RouterLink],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss',
})
export class StartComponent {}
