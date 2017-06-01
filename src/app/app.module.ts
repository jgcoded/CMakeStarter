import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MaterialModule,
  MdNativeDateModule,
  MdButtonModule,
  MdCheckboxModule
} from '@angular/material';

import { AppComponent }  from './app.component';
import { ProjectDetailComponent } from './project-detail.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { SolutionComponent } from './solution.component';
import { ProjectService } from './project.service';
import { CMakePreviewComponent } from './cmake-preview.component';
import { ProjectListComponent } from './project-list.component';
import { TreeViewComponent } from './tree-view.component';
import { AppRoutingModule } from './app-routing.module';
import { AddDependenciesComponent } from './add-dependencies.component';
import { AddProjectComponent } from './add-project.component';
import { CodeMirrorComponent } from './code-mirror.component';
import { HomeComponent } from './home.component';

import '../../node_modules/@angular/material/prebuilt-themes/indigo-pink.css';
import '../styles.css';
import '../../node_modules/hammerjs/hammer.min.js';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    MaterialModule,
    MdNativeDateModule,
    MdButtonModule,
    MdCheckboxModule,
  ],
  declarations: [
    AppComponent,
    ConfirmDialogComponent,
    SolutionComponent,
    ProjectDetailComponent,
    CMakePreviewComponent,
    ProjectListComponent,
    AddDependenciesComponent,
    TreeViewComponent,
    AddProjectComponent,
    CodeMirrorComponent,
    HomeComponent
  ],
  entryComponents: [
    ConfirmDialogComponent
  ],
  bootstrap:    [ AppComponent ],
  providers: [ ProjectService ]
})
export class AppModule { }

