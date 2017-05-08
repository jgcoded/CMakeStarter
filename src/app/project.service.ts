import { Injectable } from '@angular/core';
import { Project, ThirdPartyProject } from './models';
import { SOLUTION_NAME, PROJECTS, MAKE_PROJECTS, CMAKE_PROJECTS, DEPENDENCY_GRAPH } from './mock-projects';
import { AdjacencyList, topologicalSort } from './graph';

import { 
  GenerateRootCMakeListsTxt,
  GenerateSubprojectCMakeListsTxt,
  GenerateSrcDirectoryCMakeListsTxt,
  GenerateThirdPartyCMakeFile
 } from './gen';

@Injectable()
export class ProjectService {

  uniqueId: number = 100;
  // Use this function when creating a new project
  private getUniqueId(): number {
    return this.uniqueId++;
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

  generateRootCMakeFile(): Promise<string> {
    return Promise.resolve(GenerateRootCMakeListsTxt(SOLUTION_NAME));
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
    let sortedProjectIds = topologicalSort(subgraph).reverse();

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


    let sortedThirdParty = topologicalSort(subgraph).reverse();
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

    return this.getDependencies(project.id).then(projects => {

      let subprojects: Array<Project> = [];
      let thirdParty: Array<ThirdPartyProject> = [];

      projects.forEach(project => {
        if((<ThirdPartyProject>project).sourceType === undefined) {
          subprojects.push(project);
        } else {
          thirdParty.push(<ThirdPartyProject>project);
        }

      });
      return GenerateSubprojectCMakeListsTxt(project, subprojects, thirdParty);
    });
  }

  addDependenciesToProject(id: number, dependencies: Array<number>): Promise<void> {
    return Promise.resolve(DEPENDENCY_GRAPH.set(id, DEPENDENCY_GRAPH.get(id).concat(dependencies))).then(() => Promise.resolve());
  }

  removeDependency(id: number, dependencyId: number): Promise<void> {
    return Promise.resolve(DEPENDENCY_GRAPH.set(id, DEPENDENCY_GRAPH.get(id).filter(projectId => projectId !== dependencyId)))
      .then(() => {});
  }

}
