import { Project, ProjectType, CMakeThirdPartyProject, MakeThirdPartyProject, ThirdPartySource } from './models';

export const PROJECTS: Project[] = [
    { name: "amcs", type: ProjectType.StaticLibrary },
    { name: "amcs-tool", type: ProjectType.Exectuable },
    { name: "amcs-client", type: ProjectType.Exectuable }
];

export const MAKE_PROJECTS: MakeThirdPartyProject[] = [
    {
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