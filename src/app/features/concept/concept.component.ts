import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-concept',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './concept.component.html',
  styleUrl: './concept.component.scss',
})
export class ConceptComponent {}
