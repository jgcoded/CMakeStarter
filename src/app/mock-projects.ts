import { 
  Project, 
  CMakePackage,
  CMAKE_PACKAGE_TO_NAME,
  ThirdPartyProject,
  ThirdPartySource,
  FindPackageProject,
  UserProject
} from './models';
import { AdjacencyList } from './graph';

export interface Solution {
  solutionName: string;
  userProjects: Array<Project>;
  thirdPartyProjects: Array<Project>;
  findPackageProjects: Array<FindPackageProject>;
  dependencyGraph: Map<number, Array<number>>;
}

export const DEFAULT_SOLUTION: Solution = {
  solutionName: 'MyProject',
  userProjects: [
    { id: 0, kind: 'library', name: 'mylib' },
    { id: 1, kind: 'executable', name: 'app' },
    { id: 3, kind: 'executable', name: 'tests' }
  ],
  thirdPartyProjects: [
      {
        id: 5,
        kind: 'thirdparty',
        name: 'gtest',
        source: {
          kind: 'file',
          fileUrl: 'https://github.com/google/googletest/archive/release-1.8.0.tar.gz'
        },
        buildTool: {
          kind: 'cmake',
          cmakeArguments: [
            '-DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}',
            '-DCMAKE_INSTALL_PREFIX=${THIRD_PARTY_INSTALL_PREFIX}'
          ]
        },
        libraryOutputs: [
          {
            name: 'gtest',
            isStaticLibrary: true,
            outputDirectory: '${THIRD_PARTY_INSTALL_PREFIX}/lib'
          }
        ]
      }
  ],
  findPackageProjects: [
    {
      id: 6,
      kind: 'findpackage',
      package: CMakePackage.Boost,
      required: true
    }
  ],
  dependencyGraph: new Map<number, Array<number>>([
    // 0 = mylib has no dependencies
    [0, []],
    // 1 = app depends on boost and mylib
    [1, [0, 6]],
    // 3 = tests depend on mylib, boost, and gtest
    [3, [0, 5, 6]],
    // 5 = gtest
    [5, []],
    // 6 = boost - find package dependencies must still be in the graph
    [6, []]
  ])
};
