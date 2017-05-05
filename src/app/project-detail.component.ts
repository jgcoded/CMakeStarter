import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectService } from './project.service';
import 'rxjs/add/operator/switchMap';
import { Project, ProjectType, CMakeThirdPartyProject } from './models';

const PROJECT_TYPE_TO_NAME: Array<string> = new Array<string>();
PROJECT_TYPE_TO_NAME[ProjectType.Exectuable] = "Executable";
PROJECT_TYPE_TO_NAME[ProjectType.SharedLibrary] = "Shared Library";
PROJECT_TYPE_TO_NAME[ProjectType.StaticLibrary] = "Static Library";

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
    projectTypeToName: Array<string> = PROJECT_TYPE_TO_NAME;
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
}
