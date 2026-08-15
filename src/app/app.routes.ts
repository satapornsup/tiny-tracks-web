import { Routes } from '@angular/router';
import { StartComponent } from './features/start/start.component';
import { StoryComponent } from './features/story/story.component';
import { HomeComponent } from './features/home/home.component';
import { pageTransitionGuard } from './shared/guards/page-transition.guard';

export const routes: Routes = [
  { path: '', component: StartComponent, canDeactivate: [pageTransitionGuard] },
  { path: 'story', component: StoryComponent, canDeactivate: [pageTransitionGuard] },
  { path: 'home', component: HomeComponent, canDeactivate: [pageTransitionGuard] },
];
