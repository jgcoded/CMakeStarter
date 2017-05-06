import { Component, OnInit, EventEmitter } from '@angular/core';
import { Project } from './models';
import { ProjectService } from './project.service';
import { Tree } from './tree-view.component';
import { GenerateSubprojectCMakeListsTxt } from './gen';

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

  tree: Tree = {
    value: "Project Root/",
    children: [
      {
        value: "cmake/",
        children: [
          {
            value: "3rdParty.cmake",
            children: []
          }
        ]
      },
      {
        value: "src/",
        children: [
          {
            value: "CMakeLists.txt",
            children: []
          }
        ]
      },
      {
        value: "CMakeLists.txt",
        children: []
      },
      {
        value: ".gitignore",
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
  }

  onNodeSelected(node: Tree) {
    let foundProject : Project = this.userProjects.find(project => project.id === node.id);
    if(foundProject) {
      this.previewTitle = `CMakeLists.txt for ${foundProject.name}`;
      this.preview = GenerateSubprojectCMakeListsTxt(foundProject, [], []);
    }
  }

}
