import { Injectable } from '@angular/core';
import { Project } from './models';
import { PROJECTS, MAKE_PROJECTS, CMAKE_PROJECTS } from './mock-projects';

@Injectable()
export class ProjectService {
  getProjects() : Promise<Project[]> {
    return Promise.resolve(PROJECTS.concat(MAKE_PROJECTS).concat(CMAKE_PROJECTS));
  }

  getProject(name: string): Promise<Project> {
    return this.getProjects()
      .then(projects => projects.find(project => project.name === name));
  }
}
