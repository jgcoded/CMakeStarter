import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project, CMAKE_PACKAGE_TO_NAME } from './models';
import { ProjectService } from './project.service';

@Component({
  selector: 'solution',
  templateUrl: './solution.component.html',
  styles: [`

button {
  margin: 1em;
}
`]
})
export class SolutionComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private router : Router
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
    if(project.kind === 'thirdparty' && project.source.kind === 'findpackage') {
      return CMAKE_PACKAGE_TO_NAME[project.source.package];
    }

    return project.name;
  }

  onSelect(project: Project): void {
    this.selectedProject = project;
  }

  gotoDetail(): void {
    this.router.navigate(['/detail', this.selectedProject.id]);
  }

  gotoAddProject(): void {
    this.router.navigate(['/add-project']);
  }

  onDeleteProject(project: Project): void {

    this.projectService.deleteProject(project.id)
      .then(() => this.projectService.getProjects())
      .then(projects => {
        this.projects = projects;

      });
  }
}
