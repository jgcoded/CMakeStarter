import { Project, ProjectType, CMakeThirdPartyProject, MakeThirdPartyProject, ThirdPartySource } from './models';
import { AdjacencyList } from './graph';

export interface Solution {
  solutionName: string,
  userProjects: Array<Project>,
  makeProjects: Array<MakeThirdPartyProject>,
  cmakeProjects: Array<CMakeThirdPartyProject>,
  dependencyGraph: Map<number, Array<number>>
}

export const DEFAULT_SOLUTION: Solution = {
  solutionName: "MyProject",
  userProjects: [
    { id: 0, name: "mylib", type: ProjectType.StaticLibrary },
    { id: 1, name: "app", type: ProjectType.Executable },
    { id: 3, name: "tests", type: ProjectType.Executable }
  ],
  makeProjects: [],
  cmakeProjects: [
      {
        id: 5,
        name: "gtest",
        type: ProjectType.StaticLibrary,
        sourceType: ThirdPartySource.File,
        location: "https://github.com/google/googletest/archive/release-1.8.0.tar.gz",
        cmakeArguments: [
          "-DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}",
          "-DCMAKE_INSTALL_PREFIX=${THIRD_PARTY_INSTALL_PREFIX}"
        ]
      }
  ],
  dependencyGraph: new Map<number, Array<number>>([
    // 0 = mylib has no dependencies
    [0, []],
    // 1 = app depends on mylib
    [1, [0]],
    // 3 = tests depend on mylib and gtest
    [3, [0, 5]],
    // 5 = gtest
    [5, []]
  ])
};
