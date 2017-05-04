import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project, ProjectType } from './models';
import { ProjectService } from './project.service';


const PROJECT_TYPE_TO_BADGE: Array<string> = new Array<string>();
PROJECT_TYPE_TO_BADGE[ProjectType.Exectuable] = "EX";
PROJECT_TYPE_TO_BADGE[ProjectType.SharedLibrary] = "SH";
PROJECT_TYPE_TO_BADGE[ProjectType.StaticLibrary] = "ST";

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
  projectTypeBadges: Array<string>;

  ngOnInit(): void {
    this.getProjects();
    this.projectTypeBadges = PROJECT_TYPE_TO_BADGE;
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
}
