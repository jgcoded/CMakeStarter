import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CMakePreviewComponent } from './cmake-preview.component';
import { SolutionComponent } from './solution.component';
import { ProjectDetailComponent } from './project-detail.component';
import { AddDependenciesComponent} from './add-dependencies.component';
import { AddProjectComponent } from './add-project.component';
import { HomeComponent } from './home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'solution', component: SolutionComponent },
  { path: 'cmake-preview', component: CMakePreviewComponent },
  { path: 'detail/:id', component: ProjectDetailComponent },
  { path: 'add-dependencies/:id', component: AddDependenciesComponent },
  { path: 'add-project', component: AddProjectComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
