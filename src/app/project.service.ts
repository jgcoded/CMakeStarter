import { Injectable } from '@angular/core';
import { Project } from './models';
import { PROJECTS, MAKE_PROJECTS, CMAKE_PROJECTS, DEPENDENCY_GRAPH } from './mock-projects';
import { AdjacencyList } from './graph';

@Injectable()
export class ProjectService {

  uniqueId: number = 100;
  // Use this function when creating a new project
  private getUniqueId(): number {
    return this.uniqueId++;
  }

  getProjects() : Promise<Array<Project>> {
    return Promise.resolve(PROJECTS.concat(MAKE_PROJECTS).concat(CMAKE_PROJECTS));
  }

  getProject(id: number): Promise<Project> {
    return this.getProjects()
      .then(projects => projects.find(project => project.id === id));
  }

  getDependencies(id: number) : Promise<Array<Project>> {
    return Promise.resolve(DEPENDENCY_GRAPH.get(id)).then(depIds => Promise.all(depIds.map(depId => this.getProject(depId))));
  }

  getDependencyIds(id: number): Promise<Array<number>> {
    return Promise.resolve(DEPENDENCY_GRAPH.get(id));
  }

  addDependenciesToProject(id: number, dependencies: Array<number>): Promise<void> {
    return Promise.resolve(DEPENDENCY_GRAPH.set(id, DEPENDENCY_GRAPH.get(id).concat(dependencies))).then(() => Promise.resolve());
  }

  removeDependency(id: number, dependencyId: number): Promise<void> {
    return Promise.resolve(DEPENDENCY_GRAPH.set(id, DEPENDENCY_GRAPH.get(id).filter(projectId => projectId !== dependencyId)))
      .then(() => {});
  }
}
