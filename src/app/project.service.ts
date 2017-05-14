import { Injectable } from '@angular/core';
import { Project, ProjectType, ThirdPartyProject, CMakeThirdPartyProject, MakeThirdPartyProject } from './models';
import { SOLUTION_NAME, PROJECTS, MAKE_PROJECTS, CMAKE_PROJECTS, DEPENDENCY_GRAPH } from './mock-projects';
import { AdjacencyList, topologicalSort } from './graph';

import * as JSZip from 'jszip';
import * as saveAs from 'file-saver';

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
    return Promise.resolve(SOLUTION_NAME);
  }

  getProjects() : Promise<Array<Project>> {
    return Promise.resolve(PROJECTS.concat(MAKE_PROJECTS).concat(CMAKE_PROJECTS));
  }

  getProject(id: number): Promise<Project> {
    return this.getProjects()
      .then(projects => projects.find(project => project.id === id));
  }

  getUserProjects(): Promise<Array<Project>> {
    return Promise.resolve(PROJECTS);
  }

  getDependencies(id: number) : Promise<Array<Project>> {
    return Promise.resolve(DEPENDENCY_GRAPH.get(id)).then(depIds => Promise.all(depIds.map(depId => this.getProject(depId))));
  }

  getDependencyIds(id: number): Promise<Array<number>> {
    return Promise.resolve(DEPENDENCY_GRAPH.get(id));
  }

  getCandidateDependencies(id: number): Promise<Array<Project>> {

    return this.getProject(id).then(
      project => (<ThirdPartyProject>project).location !== undefined
    )
    .then(isThirdParty => {

      return this.getDependencyIds(id).then((ids: Array<number>) => {

        let projects: Array<Project> = (<Array<Project>>MAKE_PROJECTS).concat(CMAKE_PROJECTS);

        if(!isThirdParty) {
          projects = projects.concat(PROJECTS);
        }

        return projects.filter((project: Project) => project.type !== ProjectType.Exectuable && project.id !== id && ids.findIndex(depId => project.id === depId) === -1);
      });
    });
  }

  generateRootCMakeFile(): Promise<string> {
    return this.getSolutionName().then(solutionName => GenerateRootCMakeListsTxt(solutionName));
  }

  generateSrcCMakeFile(): Promise<string> {

    // Need to get all user projects topologically sorted so that sub project a
    // comes before subproject b if b depends on a

    let projectIds: Set<number> = new Set();
    let subgraph: AdjacencyList = new Map();

    PROJECTS.forEach(project => {
      projectIds.add(project.id);
    });

    PROJECTS.forEach(project => {
      let userDependencies: Array<number> = [];
      DEPENDENCY_GRAPH.get(project.id).forEach(depId => {
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
        sortedProjects => GenerateSrcDirectoryCMakeListsTxt(sortedProjects)
      ));
  }

  generateThirdPartyCMakeFile(): Promise<string> {

    // topo sort third party dependencies, 

    // get subgraph of third party deps

    let subgraph: AdjacencyList = new Map();
    let thirdParty: Array<ThirdPartyProject> = (<Array<ThirdPartyProject>>MAKE_PROJECTS).concat(CMAKE_PROJECTS);


    thirdParty.forEach(project => {
      subgraph.set(project.id, DEPENDENCY_GRAPH.get(project.id));
    });


    let sortedThirdParty = topologicalSort(subgraph);
    if(sortedThirdParty === null) {
      return Promise.reject("Could not topologically sort the dependency graph");
    }
    sortedThirdParty = sortedThirdParty.reverse();

    let thirdPartyNames = new Map<number, Array<string>>();
    thirdParty.forEach(project => {
      let deps = DEPENDENCY_GRAPH.get(project.id);

      let dependencyNames: Array<string> = [];
      
      deps.forEach(depId => {

        let found = thirdParty.find(thirdPartyProject => thirdPartyProject.id === depId);
        dependencyNames.push(found.name);
      })

      thirdPartyNames.set(project.id, dependencyNames);

    });

    return Promise.resolve(
      Promise.all(sortedThirdParty.map(depId => this.getProject(depId))))
        .then(sortedThirdPartyProjects => GenerateThirdPartyCMakeFile(<Array<ThirdPartyProject>>sortedThirdPartyProjects, thirdPartyNames));
  }

  generateUserProjectCMake(project: Project): Promise<string> {

    return this.getDependencies(project.id)
    .then(projects => {

      return this.getSolutionName()
        .then(solutionName => {
          let subprojects: Array<Project> = [];
          let thirdParty: Array<ThirdPartyProject> = [];

          projects.forEach(project => {
            if((<ThirdPartyProject>project).sourceType === undefined) {
              subprojects.push(project);
            } else {
              thirdParty.push(<ThirdPartyProject>project);
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
        PROJECTS.push(project);
        DEPENDENCY_GRAPH.set(id, []);
        return id;
      });
  }

  addCMakeThirdPartyProject(project: CMakeThirdPartyProject): Promise<number> {
    return this.getUniqueId()
      .then(id => {
        project.id = id;
        CMAKE_PROJECTS.push(project);
        DEPENDENCY_GRAPH.set(id, []);
        return id;
      })
  }

  addMakeThirdPartyProject(project: MakeThirdPartyProject): Promise<number> {
    return this.getUniqueId()
      .then(id => {
        project.id = id;
        MAKE_PROJECTS.push(project);
        DEPENDENCY_GRAPH.set(id, []);
        return id;
      });
  }

  addDependenciesToProject(id: number, dependencies: Array<number>): Promise<void> {
    return Promise.resolve(DEPENDENCY_GRAPH.set(id, DEPENDENCY_GRAPH.get(id).concat(dependencies))).then(() => Promise.resolve());
  }

  removeDependency(id: number, dependencyId: number): Promise<void> {
    return Promise.resolve(DEPENDENCY_GRAPH.set(id, DEPENDENCY_GRAPH.get(id).filter(projectId => projectId !== dependencyId)))
      .then(() => {});
  }

  deleteProject(id: number): Promise<void> {
    return Promise.resolve(DEPENDENCY_GRAPH.delete(id))
      .then(() => {

        DEPENDENCY_GRAPH.forEach(list => {
          let foundIndex: number = list.findIndex(depId => depId === id);
          if(foundIndex > -1) {
            list.splice(foundIndex, 1);
          }
        });

      }).then(() => {
        let foundIndex: number = -1;

        foundIndex = PROJECTS.findIndex(project => project.id === id);
        if(foundIndex > -1) {
          PROJECTS.splice(foundIndex, 1);
        }

        foundIndex = MAKE_PROJECTS.findIndex(project => project.id === id);
        if(foundIndex > -1) {
          MAKE_PROJECTS.splice(foundIndex, 1);
        }

        foundIndex = CMAKE_PROJECTS.findIndex(project => project.id === id);
        if(foundIndex > -1) {
          CMAKE_PROJECTS.splice(foundIndex, 1);
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

              if(project.type === ProjectType.Exectuable) {

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
