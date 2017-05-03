import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { SolutionComponent } from './solution.component';
import { ProjectDetailComponent } from './project-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'solution', component: SolutionComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'detail/:name', component: ProjectDetailComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
