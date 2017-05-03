import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project, ProjectType } from './models';
import { ProjectService } from './project.service';

@Component({
  selector: 'solution',
  templateUrl: './solution.component.html',
  styleUrls: [ './solution.component.css']
})
export class SolutionComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private router : Router
  ) {}

  projects : Project[];
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
    this.router.navigate(['/detail', this.selectedProject.name]);
  }

  projectTypeToString(type: ProjectType): string {
      switch (type) {
        case ProjectType.Exectuable:
          return "EX";

        case ProjectType.SharedLibrary:
          return "SH";

        case ProjectType.StaticLibrary:
          return "ST";
      
        default:
          break;
      }
      return "Invalid Project";
  }
}
