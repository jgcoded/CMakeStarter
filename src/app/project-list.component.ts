import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Project, CMAKE_PACKAGE_TO_NAME } from './models';


@Component({
  selector: 'project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent {
  
  @Input() projects: Array<Project>;
  @Input() multiselect: boolean = false;
  @Input() deletable: boolean = false;
  @Output() selectRequest = new EventEmitter<Project>();
  @Output() multiSelectRequest = new EventEmitter<Array<number>>();
  @Output() deleteRequest = new EventEmitter<Project>();

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

  onDelete(project: Project): void {
    if(this.deletable) {
      this.deleteRequest.emit(project)
    }
  }

  projectName(project: Project): string {
    if(project.kind === 'thirdparty' && project.source.kind === 'findpackage') {
      return CMAKE_PACKAGE_TO_NAME[project.source.package];
    }

    return project.name;
  }
}