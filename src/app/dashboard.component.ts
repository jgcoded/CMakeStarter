import { Component, OnInit, EventEmitter } from '@angular/core';
import { Project } from './models';
import { ProjectService } from './project.service';
import { Tree } from './tree-view.component';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private projectService: ProjectService) { }

  onNodeSelectedEvent = new EventEmitter<Tree>();
  previewTitle: string;
  preview: string;
  userProjects: Project[];

  readonly THIRDPARTY_CMAKE_NODE_ID: number = -1;
  readonly ROOT_CMAKE_NODE_ID: number = -2;
  readonly SRC_CMAKE_NODE_ID: number = -3;

  tree: Tree = {
    value: "Project Root/",
    children: [
      {
        value: "cmake/",
        children: [
          {
            id: this.THIRDPARTY_CMAKE_NODE_ID,
            value: "3rdParty.cmake",
            children: []
          }
        ]
      },
      {
        value: "src/",
        children: []
      },
      {
        id: this.ROOT_CMAKE_NODE_ID,
        value: "CMakeLists.txt",
        children: []
      }
    ]
  }

  ngOnInit(): void {

    this.projectService.getUserProjects()
      .then(userProjects => { this.userProjects = userProjects; this.updateTree(); })

    this.onNodeSelectedEvent.subscribe((value: Tree) => this.onNodeSelected(value));
  }

  updateTree(): void {

    let srcNode: Tree = this.tree.children[1];
    srcNode.children.splice(0);
    this.userProjects.forEach(project => {
      srcNode.children.push(
        {
          value: project.name,
          children: [
            {
              id: project.id,
              value: "CMakeLists.txt",
              children: []
            }
          ]
        }
      )
    });

    srcNode.children.push({
      id: this.SRC_CMAKE_NODE_ID,
      value: "CMakeLists.txt",
      children: []
    });
  }

  generateZip(): void {
    this.projectService.generateZipFile()
      .then(() => console.log('Zip file generation succeeded'))
      .catch(reason => console.log(`Zip file generation failed: ${reason}`));
  }

  onNodeSelected(node: Tree) {

    let promise: Promise<string> = null;

    switch (node.id) {

      case this.ROOT_CMAKE_NODE_ID:

        this.previewTitle = "Root directory CMake file";
        promise = this.projectService.generateRootCMakeFile();

        break;

      case this.SRC_CMAKE_NODE_ID:
        this.previewTitle = "src/ directory CMakeLists.txt";
        promise = this.projectService.generateSrcCMakeFile();
        break;

      case this.THIRDPARTY_CMAKE_NODE_ID:
        this.previewTitle = "Third party CMake file";
        promise = this.projectService.generateThirdPartyCMakeFile();
        break;

      default:

        if(node.value !== "CMakeLists.txt") {
          break;
        }
        let foundProject : Project = this.userProjects.find(project => project.id === node.id);
        if(foundProject) {
          this.previewTitle = `CMakeLists.txt for ${foundProject.name}`;
          promise = this.projectService.generateUserProjectCMake(foundProject);
        }
        break;
    }

    if(promise) {
      promise.then(value => this.preview = value)
        .catch(reason => this.preview = `Error: Could not generate this file: ${reason}`);
    }

  }

}
