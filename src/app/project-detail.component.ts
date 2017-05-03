import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectService } from './project.service';
import 'rxjs/add/operator/switchMap';
import { Project, ProjectType, CMakeThirdPartyProject } from './models';

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

    ngOnInit(): void {
      this.route.params
        .switchMap((params: Params) => this.projectService.getProject(params['name']))
        .subscribe(project => this.project = project);
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

    projectTypeToString(type: ProjectType): string {
      switch (type) {
        case ProjectType.Exectuable:
          return "Executable";

        case ProjectType.SharedLibrary:
          return "Shared Library";

        case ProjectType.StaticLibrary:
          return "Static Library";
      
        default:
          break;
      }
      return "Invalid Project";
    }
}
