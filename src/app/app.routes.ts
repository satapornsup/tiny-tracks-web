import { Routes } from '@angular/router';
import { ConceptComponent } from './features/concept/concept.component';
import { StartComponent } from './features/start/start.component';
import { StoryComponent } from './features/story/story.component';
import { HomeComponent } from './features/home/home.component';
import { PhotoBoothComponent } from './features/photo-booth/photo-booth.component';
import { QuestionShellComponent } from './features/question/question-shell.component';
import { ResultComponent } from './features/result/result.component';
import { SafetyTipsComponent } from './features/safety/safety-tips.component';
import { pageTransitionGuard } from './shared/guards/page-transition.guard';
import { quizGuard } from './shared/guards/quiz.guard';

/* one literal route per question id (not "/question/:id") — that keeps
   Q1→Q2 a real route change instead of a param-only reuse, so
   pageTransitionGuard (and its cross-fade) fires the same way it does
   everywhere else. See question-shell.component.ts. */
const questionRoutes: Routes = ([1, 2, 3, 4, 5, 6] as const).map((id) => ({
  path: `question/${id}`,
  component: QuestionShellComponent,
  data: { questionId: id },
  canActivate: [quizGuard],
  canDeactivate: [pageTransitionGuard],
}));

export const routes: Routes = [
  { path: '', component: StartComponent, canDeactivate: [pageTransitionGuard] },
  { path: 'story', component: StoryComponent, canDeactivate: [pageTransitionGuard] },
  { path: 'home', component: HomeComponent, canDeactivate: [pageTransitionGuard] },
  ...questionRoutes,
  {
    path: 'result',
    component: ResultComponent,
    canActivate: [quizGuard],
    canDeactivate: [pageTransitionGuard],
  },
  { path: 'safety', component: SafetyTipsComponent, canDeactivate: [pageTransitionGuard] },
  { path: 'photo-booth', component: PhotoBoothComponent, canDeactivate: [pageTransitionGuard] },
  { path: 'concept', component: ConceptComponent, canDeactivate: [pageTransitionGuard] },
];
