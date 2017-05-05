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
  @Input() multiselect: boolean = false;
  @Output() selectRequest = new EventEmitter<Project>();
  @Output() multiSelectRequest = new EventEmitter<Array<number>>();

  projectTypeBadges: Array<string> = PROJECT_TYPE_TO_BADGE;

  selectedProjects = new Set<number>();

  onSelect(project: Project): void {
    this.selectRequest.emit(project);
    if(this.multiselect) {

      // toggle set membership
      if(this.selectedProjects.has(project.id)) {
        this.selectedProjects.delete(project.id);
      } else {
        this.selectedProjects.add(project.id);
      }
      
      this.multiSelectRequest.emit(Array.from(this.selectedProjects));

    } else {
      this.selectedProjects.clear();
      this.selectedProjects.add(project.id);
    }
  }
}