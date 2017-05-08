import { Component } from '@angular/core';
import { ProjectService } from './project.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectType, ThirdPartySource, PROJECT_TYPE_TO_NAME, SOURCE_TYPE_TO_NAME } from './models';

@Component({
  selector: 'add-project',
  template: `

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
  <label for="thirdPartyCheckBox">Is this a third party dependency?</label>
</div>

<div *ngIf="isThirdPartyProject">
<select>
  <option value="0">Script-based build</option>
  <option value="1">CMake-based build</option>
</select>
</div>

<button (click)="cancel()">Cancel</button>  
<button (click)="submit()">Submit</button>

`,
  styles: [``]
})
export class AddProjectComponent {

  constructor(
    private projectService: ProjectService,
    private location: Location,
    private router: Router
  ){}

  projectName: string;
  projectType: ProjectType = ProjectType.Exectuable;
  isThirdPartyProject: boolean = false;
  thirdPartySource: ThirdPartySource;
  isCMakeBasedProject: boolean = true;
  readonly projectTypeToName: Array<string> = PROJECT_TYPE_TO_NAME;

  cancel(): void {
    this.router.navigate(['/solution']);
  }

  submit(): void {
    console.log(this.isThirdPartyProject);
  }
}