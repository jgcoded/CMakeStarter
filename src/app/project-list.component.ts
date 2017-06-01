import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Router } from "@angular/router";
import { Project, CMAKE_PACKAGE_TO_NAME } from './models';


@Component({
  selector: 'project-list',
  templateUrl: './project-list.component.html',
  styles: [`
.project-card {
  width: 200px;
  display: inline-block;
}

.project-card .selected {
  
}
  `]
})
export class ProjectListComponent {
  
  @Input() projects: Array<Project>;
  @Input() selectable: boolean = false;
  @Input() multiselect: boolean = false;
  @Input() deletable: boolean = false;
  @Input() editable: boolean = false;
  @Output() selectRequest = new EventEmitter<Project>();
  @Output() multiSelectRequest = new EventEmitter<Array<number>>();
  @Output() deleteRequest = new EventEmitter<Project>();

  selectedProjects = new Set<number>();

  constructor(
    private router: Router
  ) {}

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
    if(project.kind === 'findpackage') {
      return CMAKE_PACKAGE_TO_NAME[project.package];
    }

    return project.name;
  }

  gotoProjectDetails(project: Project): void {
    this.router.navigate(['/detail', project.id]);
  }
}