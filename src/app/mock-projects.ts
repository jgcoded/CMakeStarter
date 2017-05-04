import { Project, ProjectType, CMakeThirdPartyProject, MakeThirdPartyProject, ThirdPartySource } from './models';
import { AdjacencyList } from './graph';

export const PROJECTS: Project[] = [
    { id: 0, name: "solver", type: ProjectType.StaticLibrary },
    { id: 1, name: "tool", type: ProjectType.Exectuable },
    { id: 2, name: "client", type: ProjectType.Exectuable },
    { id: 3, name: "tests", type: ProjectType.Exectuable }
];

export const MAKE_PROJECTS: MakeThirdPartyProject[] = [
    {
      id: 4,
      name: "mongoc",
      type: ProjectType.SharedLibrary,
      sourceType: ThirdPartySource.File,
      location: "https://github.com/mongodb/mongo-c-driver/releases/download/1.6.1/mongo-c-driver-1.6.1.tar.gz",
      configureCommand: `\${SOURCE_DIR}/configure
  --disable-automatic-init-and-cleanup
  --enable-tests=no
  --enable-examples=no
  --with-libbson=bundled
  --prefix=\${THIRD_PARTY_INSTALL_PREFIX}
`,
      buildCommand: "make",
      installCommand: "make install"
    }
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

export const DEPENDENCY_GRAPH: AdjacencyList = new Map<number, Array<number>>([
// 0 = solver has no dependencies
[0, []],
// 1 = tool depends solver
[1, [0]],
// 2 = client depends on solver and mongoc
[2, [0, 4]],
// 3 = tests depend on solver and gtest
[3, [0, 5]],
// 4 = mongoc depends on bsonc, but that comes bundled
[4, []],
// 5 = gtest
[5, []]
]);
