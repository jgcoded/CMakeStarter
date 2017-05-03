import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectService } from './project.service';
import 'rxjs/add/operator/switchMap';
import { Project } from './models';

@Component({
    selector: 'project-detail',
    templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent implements OnInit {

    constructor(
      private projectService: ProjectService,
      private route: ActivatedRoute,
      private location: Location
    ) {}

    project: Project;

    ngOnInit(): void {
      this.route.params
        .switchMap((params: Params) => this.projectService.getProject(params['name']))
        .subscribe(project => this.project = project);
    }

    goBack(): void {
      this.location.back();
    }
}
