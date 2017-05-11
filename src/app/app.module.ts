import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent }  from './app.component';
import { ProjectDetailComponent } from './project-detail.component';
import { SolutionComponent } from './solution.component';
import { ProjectService } from './project.service';
import { CMakePreviewComponent } from './cmake-preview.component';
import { ProjectListComponent } from './project-list.component';
import { TreeViewComponent } from './tree-view.component';
import { AppRoutingModule } from './app-routing.module';
import { AddDependenciesComponent } from './add-dependencies.component';
import { AddProjectComponent } from './add-project.component';
import { CodeMirrorComponent } from './code-mirror.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    SolutionComponent,
    ProjectDetailComponent,
    CMakePreviewComponent,
    ProjectListComponent,
    AddDependenciesComponent,
    TreeViewComponent,
    AddProjectComponent,
    CodeMirrorComponent
  ],
  bootstrap:    [ AppComponent ],
  providers: [ ProjectService ]
})
export class AppModule { }

