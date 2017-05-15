import { Component } from '@angular/core';
import { ProjectService } from './project.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Project, CMakeThirdPartyProject, MakeThirdPartyProject, ProjectType, ThirdPartySource, PROJECT_TYPE_TO_NAME, SOURCE_TYPE_TO_NAME } from './models';

@Component({
  selector: 'add-project',
  template: `

<h2>Add a project</h2>

<div>
  <label>Project Name: </label>
  <input [(ngModel)]="projectName" placeholder="A project name" />
</div>

<div>
  <label>Project Type: </label>
  <select [(ngModel)]="projectType">
    <option *ngFor="let type of projectTypeToName; let i=index" [value]="i">{{type}}</option>
  </select>
</div>

<div>
  <input id="thirdPartyCheckBox" type="checkbox" [(ngModel)]="isThirdPartyProject" />
  <label>Is this a third party dependency?</label>
</div>

<div *ngIf="isThirdPartyProject">
  <select [(ngModel)]="projectBuildType">
    <option value="make">Script-based build</option>
    <option value="cmake">CMake-based build</option>
  </select>
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
input {
  height: 2em;
  font-size: 1em;
  padding-left: .4em;
}
input[type="checkbox"] {
  height: auto;
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
  projectType: ProjectType = ProjectType.Executable;
  isThirdPartyProject: boolean = false;
  projectBuildType: string = "cmake";
  readonly projectTypeToName: Array<string> = PROJECT_TYPE_TO_NAME;

  cancel(): void {
    this.router.navigate(['/solution']);
  }

  submit(): void {

    let promise: Promise<number> = null;

    if(this.isThirdPartyProject) {

      if(this.projectBuildType === "cmake") {

        let project: CMakeThirdPartyProject = {
          id: 0,
          name: this.projectName,
          type: this.projectType,
          sourceType: ThirdPartySource.Git,
          location: '',
          cmakeArguments: [
            "-DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}",
            "-DCMAKE_INSTALL_PREFIX=${THIRD_PARTY_INSTALL_PREFIX}"
          ]
        }

        promise = this.projectService.addCMakeThirdPartyProject(project);

      } else if(this.projectBuildType ==="make") {

        let project: MakeThirdPartyProject = {
          id: 0,
          name: this.projectName,
          type: this.projectType,
          sourceType: ThirdPartySource.File,
          location: '',
          configureCommand: '',
          buildCommand: '',
          installCommand: ''
        }

        promise = this.projectService.addMakeThirdPartyProject(project);
      }

    } else {
      let project: Project = {
        id: 0,
        name: this.projectName,
        type: this.projectType
      };

      promise = this.projectService.addProject(project);
    }

    if(promise) {
        promise.then(id => this.router.navigate(['/detail', id]));
    }

  }
}