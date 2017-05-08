import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectService } from './project.service';
import 'rxjs/add/operator/switchMap';
import { Project, ProjectType, CMakeThirdPartyProject, PROJECT_TYPE_TO_NAME } from './models';

@Component({
    selector: 'project-detail',
    templateUrl: './project-detail.component.html',
    styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {

    constructor(
      private projectService: ProjectService,
      private route: ActivatedRoute,
      private router: Router,
      private location: Location
    ) {}

    project: Project;
    readonly projectTypeToName: Array<string> = PROJECT_TYPE_TO_NAME;
    projectDependencies: Array<Project>;

    ngOnInit(): void {
      this.route.params
        .switchMap((params: Params) => this.projectService.getProject(+params['id']))
        .subscribe(project => this.project = project);

      this.route.params
        .switchMap((params: Params) => this.projectService.getDependencies(+params['id']))
        .subscribe(dependencies => this.projectDependencies = dependencies);
    }

    goBack(): void {
      this.location.back();
    }

    addCMakeArgument(): void {
      if((<CMakeThirdPartyProject>this.project).cmakeArguments !== undefined) {
        (<CMakeThirdPartyProject>this.project).cmakeArguments.push('');
      }
    }

    removeCMakeArgument(index: number): void {
      if((<CMakeThirdPartyProject>this.project).cmakeArguments !== undefined) {
        (<CMakeThirdPartyProject>this.project).cmakeArguments.splice(index, 1);
      }
    }

    gotoDependency(dependency: Project): void {
      this.router.navigate(['/detail', dependency.id]);
    }

    gotoAddDependencies(): void {
      this.router.navigate(['/add-dependencies', this.project.id]);
    }

    onDeleteDependency(project: Project): void {
      this.projectService.removeDependency(this.project.id, project.id)
        .then(() => this.projectService.getDependencies(this.project.id))
        .then(dependencies => this.projectDependencies = dependencies);
    }
}
