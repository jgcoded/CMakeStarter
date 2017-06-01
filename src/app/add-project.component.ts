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
  template: `

<h2>Add a project</h2>

<div>
  <input id="thirdPartyCheckBox" type="checkbox" [(ngModel)]="isThirdPartyProject" />
  <label>Is this a third party dependency?</label>
</div>

<div *ngIf="isThirdPartyProject">

  <div>
  <label>How should CMake obtain this project?</label>
  <select [(ngModel)]="projectSource">
    <option value="vcs">Version Control</option>
    <option value="file">Archive File</option>
    <option value="findpackage">CMake FindPackage</option>
  </select>
  </div>

  <div *ngIf="projectSource!=='findpackage'">
    <label>How should CMake build this project?</label>
    <select [(ngModel)]="projectBuildTool">
      <option value="none">None - No build necessary</option>
      <option value="cmake">CMake-based build</option>
      <option value="make">Script-based build</option>
    </select>
  </div>

  <div *ngIf="projectSource==='findpackage'">
    <label>Select the CMake package</label>
    <select [(ngModel)]="cmakePackage">
      <option *ngFor="let package of cmakePackageToName; let i=index" [value]="i">{{package}}</option>
    </select>
  </div>
</div>

<div *ngIf="!isThirdPartyProject">
  <div>
    <label>Project Name: </label>
    <input [(ngModel)]="projectName" placeholder="A project name" />
  </div>

  <div>
    <label>Is this a library?: </label>
    <input type="checkbox" [(ngModel)]="isLibrary" />
  </div>
</div>


<button (click)="cancel()">Cancel</button>  
<button class="red" (click)="submit()">Submit</button>

`,
  styles: [`
label {
  display: inline-block;
  margin: .5em 0;
  color: #607D8B;
  font-weight: bold;
}
select {
  margin-bottom: 1em;
}
button {
  margin: 1em;
}
`]
})
export class AddProjectComponent {

  constructor(
    private projectService: ProjectService,
    private location: Location,
    private router: Router
  ){}

  projectName: string;
  projectSource: string = "vcs";
  projectBuildTool: string = "none";
  isThirdPartyProject: boolean = false;
  isLibrary: boolean = false;
  cmakePackage: CMakePackage = CMakePackage.Boost;
  cmakePackageToName: Array<String> = CMAKE_PACKAGE_TO_NAME;

  cancel(): void {
    this.router.navigate(['/solution']);
  }

  submit(): void {

    let project: Project;
    if(this.isThirdPartyProject) {

      let source: ThirdPartySource;
  
      if(this.projectSource === 'vcs') {

        source = {
          kind: 'vcs',
          versionControlSystem: VersionControlSystem.Git,
          repoUrl: ''
        }
      
      } else if(this.projectSource === 'file') {

        source = {
          kind: 'file',
          fileUrl: ''
        };
      }

      let buildTool: BuildTool = undefined;
      if(this.projectBuildTool === 'cmake') {
        buildTool = {
          kind: 'cmake',
          cmakeArguments: [
            '-DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}',
            '-DCMAKE_INSTALL_PREFIX=${THIRD_PARTY_INSTALL_PREFIX}'
          ]
        }
      } else if(this.projectBuildTool === 'make') {
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

    } else if(this.projectSource === 'findpackage') {
    
      project = {
        id: 0,
        kind: 'findpackage',
        package: this.cmakePackage,
        required: true
      };

    } else { // not a third party project or findpackage project
      
      if(this.isLibrary) {
        project = {
          id: 0,
          kind: 'library',
          name: this.projectName,
          isStaticLibrary: true
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