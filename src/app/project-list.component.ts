import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Project, ProjectType } from './models';

const PROJECT_TYPE_TO_BADGE: Array<string> = new Array<string>();
PROJECT_TYPE_TO_BADGE[ProjectType.Exectuable] = "EX";
PROJECT_TYPE_TO_BADGE[ProjectType.SharedLibrary] = "SH";
PROJECT_TYPE_TO_BADGE[ProjectType.StaticLibrary] = "ST";


@Component({
  selector: 'project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent {
  
  @Input() projects: Array<Project>;
  @Output() selectRequest = new EventEmitter<Project>();

  selectedProject: Project;
  projectTypeBadges: Array<string> = PROJECT_TYPE_TO_BADGE;

  onSelect(project: Project): void {
    this.selectedProject = project;
    this.selectRequest.emit(project);
  }
}