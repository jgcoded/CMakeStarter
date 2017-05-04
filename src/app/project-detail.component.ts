import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
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
      private location: Location
    ) {}

    project: Project;
    projectTypeToName: Array<string>;

    ngOnInit(): void {
      this.route.params
        .switchMap((params: Params) => this.projectService.getProject(params['name']))
        .subscribe(project => this.project = project);
        this.projectTypeToName = PROJECT_TYPE_TO_NAME;
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
}
