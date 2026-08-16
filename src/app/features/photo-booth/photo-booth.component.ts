import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-photo-booth',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './photo-booth.component.html',
  styleUrl: './photo-booth.component.scss',
})
export class PhotoBoothComponent {}
