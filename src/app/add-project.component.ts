import { Component } from '@angular/core';
import { ProjectService } from './project.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import {
  Project,
  CMakePackage,
  CMAKE_PACKAGE_TO_NAME,
  Executable,
  Library,
  ThirdPartySource,
  ThirdPartyProject,
  VersionControlSource,
  FileSource,
  FindPackageProject,
  VersionControlSystem,
  BuildTool,
  CMakeBuildTool,
  MakeBuildTool

} from './models';

@Component({
  selector: 'add-project',
  templateUrl: './add-project.component.html',
  styles: [`
md-select {
  margin: 1em 0em;
}
button {
  margin: 2em 0em;
}
`]
})
export class AddProjectComponent {

  constructor(
    private projectService: ProjectService,
    private location: Location,
    private router: Router
  ) { }

  projectName: string;
  projectSource: string;
  projectBuildTool: string;
  isThirdPartyProject: boolean = false;
  isLibrary: boolean = false;
  cmakePackage: CMakePackage = CMakePackage.Boost;
  cmakePackageToName: Array<String> = CMAKE_PACKAGE_TO_NAME;

  cancel(): void {
    this.router.navigate(['/solution']);
  }

  submit(): void {

    let project: Project;
    if (this.isThirdPartyProject) {

      if (this.projectSource === 'findpackage') {

        project = {
          id: 0,
          kind: 'findpackage',
          package: this.cmakePackage,
          required: true
        };

      } else {

        let source: ThirdPartySource;

        if (this.projectSource === 'vcs') {

          source = {
            kind: 'vcs',
            versionControlSystem: VersionControlSystem.Git,
            repoUrl: ''
          }

        } else if (this.projectSource === 'file') {

          source = {
            kind: 'file',
            fileUrl: ''
          };
        }

        let buildTool: BuildTool = undefined;
        if (this.projectBuildTool === 'cmake') {
          buildTool = {
            kind: 'cmake',
            cmakeArguments: [
              '-DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}',
              '-DCMAKE_INSTALL_PREFIX=${THIRD_PARTY_INSTALL_PREFIX}'
            ]
          }

        } else if (this.projectBuildTool === 'make') {
          buildTool = {
            kind: 'make',
            configureCommand: '',
            buildCommand: '',
            installCommand: ''
          }
        }

        project = {
          id: 0,
          kind: 'thirdparty',
          name: '',
          source: source,
          buildTool: buildTool,
          libraryOutputs: []
        };

      }

    } else { // not a third party project or findpackage project

      if (this.isLibrary) {
        project = {
          id: 0,
          kind: 'library',
          name: this.projectName
        };
      } else {
        project = {
          id: 0,
          kind: 'executable',
          name: this.projectName,
        };
      }
    }

    this.projectService.addProject(project)
      .then(id => this.router.navigate(['/detail', id]));

  }
}