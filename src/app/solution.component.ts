import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from './models';
import { ProjectService } from './project.service';

@Component({
  selector: 'solution',
  templateUrl: './solution.component.html',
})
export class SolutionComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private router : Router
  ) {}

  projects : Array<Project>;
  selectedProject: Project;

  ngOnInit(): void {
    this.getProjects();
  }

  getProjects(): void {
    this.projectService.getProjects().then(
      projects => this.projects = projects
    );
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
      .then(projects => this.projects = projects);
  }
}
