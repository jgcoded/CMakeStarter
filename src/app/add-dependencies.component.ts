import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';
import { ProjectService } from './project.service';
import { Project } from './models';

@Component({
  selector: 'add-dependencies',
  template:`

<div>
<h2>Select the dependencies to add to the <span *ngIf="project">{{project.name}}</span> project</h2>
<project-list [projects]="candidateDependencies" selectable="true" (multiSelectRequest)="onMultiSelect($event)" multiselect="true"></project-list>
</div>

<button md-raised-button (click)="done()">Add selected dependencies</button>
<a md-raised-button  (click)="goBack()">Back</a>
`,
  styles: [`
button {
  margin: 1em;
}
  `]
})
export class AddDependenciesComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private location: Location
  ) {}

  project: Project;
  candidateDependencies: Array<Project>;
  selectedProjects: Array<number>;

  ngOnInit(): void {
    let projectId: number = -1;
    this.route.params.switchMap((param: Params) => this.projectService.getCandidateDependencies(+param['id']))
      .subscribe(candidates => this.candidateDependencies = candidates);

    this.route.params.switchMap((param: Params) => this.projectService.getProject(+param['id']))
      .subscribe((project: Project) => this.project = project);
  }

  onMultiSelect(selected: Array<number>): void {
    this.selectedProjects = selected;
  }

  goBack(): void {
    this.location.back();
  }

  done(): void {
    // update project service
    this.projectService.addDependenciesToProject(this.project.id, this.selectedProjects)
      .then(() => this.router.navigate(['/detail', this.project.id]));
  }
}