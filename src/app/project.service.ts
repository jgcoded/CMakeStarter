import { Injectable } from '@angular/core';
import { Project } from './models';
import { SOLUTION_NAME, PROJECTS, MAKE_PROJECTS, CMAKE_PROJECTS, DEPENDENCY_GRAPH } from './mock-projects';
import { AdjacencyList } from './graph';

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
    return Promise.resolve(GenerateSrcDirectoryCMakeListsTxt(PROJECTS));
  }

  generateThirdPartyCMakeFile(): Promise<string> {
    return Promise.resolve(GenerateThirdPartyCMakeFile([], new Map()));
  }

  generateUserProjectCMake(project: Project): Promise<string> {
    return Promise.resolve(GenerateSubprojectCMakeListsTxt(project, [], []));
  }

  addDependenciesToProject(id: number, dependencies: Array<number>): Promise<void> {
    return Promise.resolve(DEPENDENCY_GRAPH.set(id, DEPENDENCY_GRAPH.get(id).concat(dependencies))).then(() => Promise.resolve());
  }

  removeDependency(id: number, dependencyId: number): Promise<void> {
    return Promise.resolve(DEPENDENCY_GRAPH.set(id, DEPENDENCY_GRAPH.get(id).filter(projectId => projectId !== dependencyId)))
      .then(() => {});
  }

}
