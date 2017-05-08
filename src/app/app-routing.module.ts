import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { SolutionComponent } from './solution.component';
import { ProjectDetailComponent } from './project-detail.component';
import { AddDependenciesComponent} from './add-dependencies.component';
import { AddProjectComponent } from './add-project.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'solution', component: SolutionComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'detail/:id', component: ProjectDetailComponent },
  { path: 'add-dependencies/:id', component: AddDependenciesComponent },
  { path: 'add-project', component: AddProjectComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
