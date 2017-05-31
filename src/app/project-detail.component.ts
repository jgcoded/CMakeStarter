import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectService } from './project.service';
import 'rxjs/add/operator/switchMap';
import { Project, VersionControlSystem, CMAKE_PACKAGE_TO_NAME } from './models';

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
    projectDependencies: Array<Project>;
    cmakePackageToName: Array<String> = CMAKE_PACKAGE_TO_NAME;

    versionControlToName: Array<string>;

    ngOnInit(): void {

      let keys = Object.keys(VersionControlSystem);
      this.versionControlToName = keys.splice(keys.length/2);

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
      if(this.project.kind === 'thirdparty'
          && this.project.buildTool
          && this.project.buildTool.kind === 'cmake') {
          
          this.project.buildTool.cmakeArguments.push('');
       }
    }

    removeCMakeArgument(index: number): void {
      if(this.project.kind === 'thirdparty'
          && this.project.buildTool
          && this.project.buildTool.kind === 'cmake') {
          
          this.project.buildTool.cmakeArguments.splice(index, 1);
       }
    }

    addLibraryOutput(): void {
      if(this.project.kind === 'thirdparty') {
        if(!this.project.libraryOutputs) {
          this.project.libraryOutputs = [];
        }
        this.project.libraryOutputs.push({
          name: '',
          isStaticLibrary: true
        });
      }
    }

    removeLibraryOutput(index: number): void {
      if(this.project.kind === 'thirdparty') {
        if(!this.project.libraryOutputs) {
          return;
        }
        this.project.libraryOutputs.splice(index, 1);
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
