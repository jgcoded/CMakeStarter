import { Injectable } from '@angular/core';
import { Solution, DEFAULT_SOLUTION } from './mock-projects';
import { AdjacencyList, topologicalSort } from './graph';

import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

import {
  Project,
  ThirdPartyProject,
  Executable,
  Library,
  UserProject
} from './models';


import { 
  GenerateRootCMakeListsTxt,
  GenerateSubprojectCMakeListsTxt,
  GenerateSrcDirectoryCMakeListsTxt,
  GenerateThirdPartyCMakeFile,
  GenerateExecutableSourceCodeFile,
  GenerateLibraryHeaderFile,
  GenerateLibrarySourceFile
 } from './gen';

@Injectable()
export class ProjectService {

  uniqueId: number = 100;
  // Use this function when creating a new project
  private getUniqueId(): Promise<number> {
    return Promise.resolve(this.uniqueId++);
  }

  getSolutionName(): Promise<string> {
    return Promise.resolve(DEFAULT_SOLUTION.solutionName);
  }

  updateSolutionName(newName: string): Promise<void> {
    return Promise.resolve(DEFAULT_SOLUTION.solutionName = newName).then(() => {});
  }

  getProjects() : Promise<Array<Project>> {
    return Promise.resolve(
      DEFAULT_SOLUTION.userProjects
        .concat(DEFAULT_SOLUTION.thirdPartyProjects)
        .concat(DEFAULT_SOLUTION.findPackageProjects)
    );
  }

  getProject(id: number): Promise<Project> {
    return this.getProjects()
      .then(projects => projects.find(project => project.id === id));
  }

  getUserProjects(): Promise<Array<UserProject>> {
    return Promise.resolve(DEFAULT_SOLUTION.userProjects);
  }

  getDependencies(id: number) : Promise<Array<Project>> {
    return Promise.resolve(
      DEFAULT_SOLUTION.dependencyGraph.get(id)).then(depIds => Promise.all(depIds.map(depId => this.getProject(depId)))
    );
  }

  getDependencyIds(id: number): Promise<Array<number>> {
    return Promise.resolve(DEFAULT_SOLUTION.dependencyGraph.get(id));
  }

  getCandidateDependencies(id: number): Promise<Array<Project>> {

    return this.getProject(id).then(
      project => project.kind === 'thirdparty'
    )
    .then(isThirdParty => {

      return this.getDependencyIds(id).then((ids: Array<number>) => {

        let projects: Array<Project> = DEFAULT_SOLUTION.thirdPartyProjects
          .concat(DEFAULT_SOLUTION.findPackageProjects);

        if(!isThirdParty) {
          projects = projects.concat(DEFAULT_SOLUTION.userProjects);
        }

        return projects.filter((project: Project) =>
          project.kind !== 'executable' && project.id !== id && ids.findIndex(depId => project.id === depId) === -1);
      });
    });
  }

  generateRootCMakeFile(): Promise<string> {
    return this.getSolutionName().then(solutionName => GenerateRootCMakeListsTxt(solutionName, DEFAULT_SOLUTION.findPackageProjects));
  }

  generateSrcCMakeFile(): Promise<string> {

    // Need to get all user projects topologically sorted so that sub project a
    // comes before subproject b if b depends on a

    let projectIds: Set<number> = new Set();
    let subgraph: AdjacencyList = new Map();

    DEFAULT_SOLUTION.userProjects.forEach(project => {
      projectIds.add(project.id);
    });

    DEFAULT_SOLUTION.userProjects.forEach(project => {
      let userDependencies: Array<number> = [];
      DEFAULT_SOLUTION.dependencyGraph.get(project.id).forEach(depId => {
        if(projectIds.has(depId)) {
          userDependencies.push(depId);
        }
      });

      subgraph.set(project.id, userDependencies);
    });

    // sort
    let sortedProjectIds = topologicalSort(subgraph);
    if(sortedProjectIds === null) {
      return Promise.reject("Could not topologically sort the dependency graph");
    }
    sortedProjectIds = sortedProjectIds.reverse();

    return Promise.resolve(
      Promise.all(sortedProjectIds.map(id => this.getProject(id))).then(
        sortedProjects => GenerateSrcDirectoryCMakeListsTxt(sortedProjects as UserProject[])
      ));
  }

  generateThirdPartyCMakeFile(): Promise<string> {

    // topo sort third party dependencies, 

    // get subgraph of third party deps

    let subgraph: AdjacencyList = new Map();
    let thirdParty: Array<ThirdPartyProject> = DEFAULT_SOLUTION.thirdPartyProjects
      .filter(project => project.kind === 'thirdparty') as ThirdPartyProject[];

    thirdParty.forEach(project => {
      subgraph.set(project.id, DEFAULT_SOLUTION.dependencyGraph.get(project.id));
    });


    let sortedThirdParty = topologicalSort(subgraph);
    if(sortedThirdParty === null) {
      return Promise.reject("Could not topologically sort the dependency graph");
    }
    sortedThirdParty = sortedThirdParty.reverse();

    let thirdPartyNames = new Map<number, Array<string>>();
    thirdParty.forEach(project => {
      let deps = DEFAULT_SOLUTION.dependencyGraph.get(project.id);

      let dependencyNames: Array<string> = [];
      
      deps.forEach(depId => {

        let found = thirdParty.find(thirdPartyProject => thirdPartyProject.id === depId);
        if(!found.libraryOutputs || found.libraryOutputs.length == 0) {
          return;
        }
        found.libraryOutputs.forEach(element => {
          dependencyNames.push(element.name);
        });
      });

      thirdPartyNames.set(project.id, dependencyNames);

    });

    return Promise.resolve(
      Promise.all(sortedThirdParty.map(depId => this.getProject(depId))))
        .then(sortedThirdPartyProjects => GenerateThirdPartyCMakeFile(<Array<ThirdPartyProject>>sortedThirdPartyProjects, thirdPartyNames));
  }

  generateUserProjectCMake(project: UserProject): Promise<string> {

    return this.getDependencies(project.id)
    .then(projects => {

      return this.getSolutionName()
        .then(solutionName => {
          let subprojects: Array<UserProject> = [];
          let thirdParty: Array<ThirdPartyProject> = [];

          projects.forEach(project => {
            if(project.kind === 'thirdparty') {
              thirdParty.push(project);
            } else if(project.kind !== 'findpackage') {
              subprojects.push(project);
            }

          });
          return GenerateSubprojectCMakeListsTxt(solutionName, project, subprojects, thirdParty);
        });
    });
  }

  addProject(project: Project): Promise<number> {
    return this.getUniqueId()
      .then(id => {
        project.id = id;
        if(project.kind === 'thirdparty') {
          DEFAULT_SOLUTION.thirdPartyProjects.push(project);
        } else if(project.kind === 'findpackage') {
          DEFAULT_SOLUTION.findPackageProjects.push(project);
        } else {
          DEFAULT_SOLUTION.userProjects.push(project);
        }
        DEFAULT_SOLUTION.dependencyGraph.set(id, []);
        return id;
      });
  }

  addDependenciesToProject(id: number, dependencies: Array<number>): Promise<void> {
    return Promise.resolve(
        DEFAULT_SOLUTION.dependencyGraph.set(id, 
          DEFAULT_SOLUTION.dependencyGraph.get(id).concat(dependencies))).then(() => { });
  }

  removeDependency(id: number, dependencyId: number): Promise<void> {
    return Promise.resolve(
      DEFAULT_SOLUTION.dependencyGraph.set(id, 
        DEFAULT_SOLUTION.dependencyGraph.get(id).filter(projectId => projectId !== dependencyId)))
        .then(() => {});
  }

  deleteProject(id: number): Promise<void> {
    return Promise.resolve(DEFAULT_SOLUTION.dependencyGraph.delete(id))
      .then(() => {

        DEFAULT_SOLUTION.dependencyGraph.forEach(list => {
          let foundIndex: number = list.findIndex(depId => depId === id);
          if(foundIndex > -1) {
            list.splice(foundIndex, 1);
          }
        });

      }).then(() => {
        let foundIndex: number = -1;

        foundIndex = DEFAULT_SOLUTION.userProjects.findIndex(project => project.id === id);
        if(foundIndex > -1) {
          DEFAULT_SOLUTION.userProjects.splice(foundIndex, 1);
          return;
        }

        foundIndex = DEFAULT_SOLUTION.thirdPartyProjects.findIndex(project => project.id === id);
        if(foundIndex > -1) {
          DEFAULT_SOLUTION.thirdPartyProjects.splice(foundIndex, 1);
          return;
        }

        foundIndex = DEFAULT_SOLUTION.findPackageProjects.findIndex(project => project.id === id);
        if(foundIndex > -1) {
          DEFAULT_SOLUTION.findPackageProjects.splice(foundIndex, 1);
          return;
        }

      });
  }

  generateExecutableSourceCodeFile(): Promise<string> {
    return Promise.resolve(GenerateExecutableSourceCodeFile());
  }

  generateLibraryHeaderFile(projectName: string): Promise<string> {
    return Promise.resolve(GenerateLibraryHeaderFile(projectName));
  }

  generateLibrarySourceFile(projectName: string): Promise<string> {
    return Promise.resolve(GenerateLibrarySourceFile(projectName));
  }

  generateZipFile(): Promise<void> {

    let zip: JSZip = new JSZip();

    return this.generateRootCMakeFile()
      .then(rootCmake => {

        if(window.navigator.platform === "Win32") {
          rootCmake = rootCmake.replace(/\n/g, '\r\n');
        }

        zip.file("CMakeLists.txt", rootCmake);
        return this.generateSrcCMakeFile()
      })
      .then(srcCmake => {

        if(window.navigator.platform === "Win32") {
          srcCmake = srcCmake.replace(/\n/g, '\r\n');
        }
        zip.file("src/CMakeLists.txt", srcCmake);

        return this.generateThirdPartyCMakeFile();
      })
      .then(thirdPartyCmake => {

        if(window.navigator.platform === "Win32") {
          thirdPartyCmake = thirdPartyCmake.replace(/\n/g, '\r\n');
        }        
        zip.file("cmake/3rdParty.cmake", thirdPartyCmake);
        return this.getUserProjects();
      })
      .then(userProjects => {
        return Promise.all(userProjects.map(project =>
          this.generateUserProjectCMake(project)
            .then(projectCmake => {

              if(window.navigator.platform === "Win32") {
                projectCmake = projectCmake.replace(/\n/g, '\r\n');
              }

              let dir: string = `src/${project.name}`;

              zip.file(`${dir}/CMakeLists.txt`, projectCmake)

              if(project.kind === 'executable') {

                let sourceCode: string = GenerateExecutableSourceCodeFile();
                if(window.navigator.platform === "Win32") {
                  sourceCode = sourceCode.replace(/\n/g, '\r\n');
                }
                zip.file(`${dir}/main.cpp`, sourceCode)
              } else {
                let header = GenerateLibraryHeaderFile(project.name);
                let source = GenerateLibrarySourceFile(project.name);

                if(window.navigator.platform === "Win32") {
                  header = header.replace(/\n/g, '\r\n');
                  source = source.replace(/\n/g, '\r\n');
                }

                zip.file(`${dir}/${project.name}.h`, header);
                zip.file(`${dir}/${project.name}.cpp`, source);
              }

            })));
      })
      .then(() => zip.generateAsync({ type: 'blob'}))
      .then(content => {
        return this.getSolutionName()
          .then(name => saveAs(content, `${name}.zip`))
      });
  }

}
