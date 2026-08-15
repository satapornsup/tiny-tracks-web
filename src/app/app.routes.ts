import { Routes } from '@angular/router';
import { StartComponent } from './features/start/start.component';
import { StoryComponent } from './features/story/story.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  { path: '', component: StartComponent },
  { path: 'story', component: StoryComponent },
  { path: 'home', component: HomeComponent },
];
