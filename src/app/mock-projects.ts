import { Project, ProjectType, CMakeThirdPartyProject, MakeThirdPartyProject, ThirdPartySource } from './models';
import { AdjacencyList } from './graph';

export const SOLUTION_NAME: string = "MyProject";

export const PROJECTS: Project[] = [
    { id: 0, name: "mylib", type: ProjectType.StaticLibrary },
    { id: 1, name: "app", type: ProjectType.Exectuable },
    { id: 3, name: "tests", type: ProjectType.Exectuable }
];

export const MAKE_PROJECTS: MakeThirdPartyProject[] = [

];

export const CMAKE_PROJECTS: CMakeThirdPartyProject[] = [
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
];

export const DEPENDENCY_GRAPH = new Map<number, Array<number>>([
// 0 = mylib has no dependencies
[0, []],
// 1 = app depends on mylib
[1, [0]],
// 3 = tests depend on mylib and gtest
[3, [0, 5]],
// 5 = gtest
[5, []]
]);
