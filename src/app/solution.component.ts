import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project, CMAKE_PACKAGE_TO_NAME } from './models';
import { ProjectService } from './project.service';
import { MdDialog, MdDialogRef } from '@angular/material';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'solution',
  templateUrl: './solution.component.html',
  styles: [`

a {
  margin-top: 1em;
}
`],
  entryComponents: [
    ConfirmDialogComponent
  ]
})
export class SolutionComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private router : Router,
    private dialog: MdDialog
  ) {}

  projects : Array<Project>;
  selectedProject: Project;
  solutionName: string;
  displayedSolutionName: string;

  ngOnInit(): void {
    this.projectService.getProjects().then(
      projects => this.projects = projects
    );
    this.projectService.getSolutionName().then(
      name => { this.solutionName = name; this.displayedSolutionName = name; }
    );
  }

  updateSolutionName(): void {
    this.projectService.updateSolutionName(this.solutionName)
      .then(() => this.displayedSolutionName = this.solutionName);
  }

  projectName(project: Project): string {
    if(project.kind === 'findpackage') {
      return CMAKE_PACKAGE_TO_NAME[project.package];
    }

    return project.name;
  }

  onSelect(project: Project): void {
    this.selectedProject = project;
  }

  gotoAddProject(): void {
    this.router.navigate(['/add-project']);
  }

  onDeleteProject(project: Project): void {

    let dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result == true) {
      this.projectService.deleteProject(project.id)
        .then(() => this.projectService.getProjects())
        .then(projects => {
          this.projects = projects;
        });
      }
    });
  }
}
