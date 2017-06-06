import { Component, OnInit, EventEmitter, AfterViewInit } from '@angular/core';
import { Project, UserProject } from './models';
import { ProjectService } from './project.service';
import { Tree } from './tree-view.component';

import 'codemirror/mode/cmake/cmake.js';
import 'codemirror/mode/clike/clike.js';

@Component({
  selector: 'cmake-preview',
  templateUrl: './cmake-preview.component.html',
  styleUrls: ['./cmake-preview.component.css']
})
export class CMakePreviewComponent implements OnInit, AfterViewInit {

  constructor(private projectService: ProjectService) { }

  onNodeSelectedEvent = new EventEmitter<Tree>();
  onPreviewChange = new EventEmitter<string>();
  onChangeMode = new EventEmitter<string>();

  previewTitle: string;
  preview: string;
  userProjects: Array<UserProject>;

  readonly THIRDPARTY_CMAKE_NODE_ID: number = -1;
  readonly ROOT_CMAKE_NODE_ID: number = -2;
  readonly SRC_CMAKE_NODE_ID: number = -3;

  cmakeConfiguration: CodeMirror.EditorConfiguration = {
      lineNumbers: true,
      mode: 'cmake',
      viewportMargin: Infinity
    }

  tree: Tree = {
    value: "Project Root",
    children: [
      {
        value: "cmake",
        children: [
          {
            id: this.THIRDPARTY_CMAKE_NODE_ID,
            value: "3rdParty.cmake",
            children: []
          }
        ]
      },
      {
        value: "src",
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

  ngAfterViewInit(): void {
    this.onNodeSelected({ id: this.ROOT_CMAKE_NODE_ID, value: "CMakeLists.txt", children: [] });
  }

  updateTree(): void {

    let srcNode: Tree = this.tree.children[1];
    srcNode.children.splice(0);
    this.userProjects.forEach(project => {

      let children: Array<Tree> = [{
          id: project.id,
          value: "CMakeLists.txt",
          children: []
        }];

      if(project.kind === "executable") {
        children.push({
          id: project.id,
          value: "main.cpp",
          children: []
        });
      } else {
        children.push({
          id: project.id,
          value: `${project.name}.h`,
          children: []
        });
        children.push({
          id: project.id,
          value: `${project.name}.cpp`,
          children: []
        });
      }

      srcNode.children.push(
        {
          value: project.name,
          children: children
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
        this.onChangeMode.emit('cmake');
        break;

      case this.SRC_CMAKE_NODE_ID:
        this.previewTitle = "src/ directory CMakeLists.txt";
        promise = this.projectService.generateSrcCMakeFile();
        this.onChangeMode.emit('cmake');
        break;

      case this.THIRDPARTY_CMAKE_NODE_ID:
        this.previewTitle = "Third party CMake file";
        promise = this.projectService.generateThirdPartyCMakeFile();
        this.onChangeMode.emit('cmake');
        break;

      default:

        let foundProject : Project = this.userProjects.find(project => project.id === node.id);

        if(!foundProject) {
          break;
        }

        if(node.value === `${foundProject.name}.h`) {
            this.previewTitle = `${foundProject.name}.h`;
            promise = this.projectService.generateLibraryHeaderFile(foundProject.name);
            this.onChangeMode.emit('text/x-c++src');
        } else if(node.value === `${foundProject.name}.cpp`) {
            this.previewTitle = `${foundProject.name}.cpp`;
            promise = this.projectService.generateLibrarySourceFile(foundProject.name);
            this.onChangeMode.emit('text/x-c++src');
        } else if (node.value === 'main.cpp') {
          this.previewTitle = 'main.cpp';
          promise = this.projectService.generateExecutableSourceCodeFile();
          this.onChangeMode.emit('text/x-c++src');
        } else if(node.value === "CMakeLists.txt") {
            this.previewTitle = `CMakeLists.txt for ${foundProject.name}`;
            promise = this.projectService.generateUserProjectCMake(foundProject);
            this.onChangeMode.emit('cmake');
        }
        break;
    }

    if(promise) {
      promise.then(value => this.onPreviewChange.emit(value))
        .catch(reason => this.onPreviewChange.emit(`Error: Could not generate this file: ${reason}`));
    }

  }

}
