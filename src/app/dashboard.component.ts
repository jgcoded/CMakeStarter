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

  onNodeSelected(node: Tree) {

    switch (node.id) {

      case this.ROOT_CMAKE_NODE_ID:

        this.previewTitle = "Root directory CMake file";
        this.projectService.generateRootCMakeFile().then(
          value => this.preview = value
        );

        break;

      case this.SRC_CMAKE_NODE_ID:
        this.previewTitle = "src/ directory CMakeLists.txt";
        this.projectService.generateSrcCMakeFile().then(
          value => this.preview = value
        );
        break;

      case this.THIRDPARTY_CMAKE_NODE_ID:
        this.previewTitle = "Third party CMake file";
        this.projectService.generateThirdPartyCMakeFile().then(
          value => this.preview = value
        );
        break;

      default:

        if(node.value !== "CMakeLists.txt") {
          break;
        }
        let foundProject : Project = this.userProjects.find(project => project.id === node.id);
        if(foundProject) {
          this.previewTitle = `CMakeLists.txt for ${foundProject.name}`;
          this.projectService.generateUserProjectCMake(foundProject).then(
            value => this.preview = value
          );
        }
        break;
    }


  }

}
