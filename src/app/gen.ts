
import {
  Project,
  ThirdPartySource,
  ThirdPartyProject,
  ProjectType,
  MakeThirdPartyProject,
  CMakeThirdPartyProject
} from "./models";

export function GenerateRootCMakeListsTxt(solutionName: string): string {
  let template: string =
    `
cmake_minimum_required(VERSION 2.8.11)

project(${solutionName})

set(${solutionName}_ROOT \${CMAKE_CURRENT_LIST_DIR})
set(${solutionName}_BIN_DIR \${${solutionName}_ROOT}/bin)
set(${solutionName}_LIB_DIR \${${solutionName}_ROOT}/lib)
set(${solutionName}_CMAKE_DIR \${${solutionName}_ROOT}/cmake)
set(${solutionName}_SUBMODULES_DIR \${${solutionName}_ROOT}/submodules)

set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY \${${solutionName}_LIB_DIR})
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY \${${solutionName}_BIN_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY \${${solutionName}_BIN_DIR})

set(CMAKE_MODULE_PATH \${CMAKE_MODULE_PATH} \${${solutionName}_CMAKE_DIR})

set(CMAKE_CXX_STANDARD 11)
if(\${CMAKE_MAJOR_VERSION}.\${CMAKE_MINOR_VERSION} LESS 3.1)
    set(CMAKE_CXX_FLAGS "\${CMAKE_CXX_FLAGS} -std=c++11")
endif()

#Use solution folders
set_property(GLOBAL PROPERTY USE_FOLDERS ON)
set_property(GLOBAL PROPERTY AUTOGEN_TARGETS_FOLDER "Generated")

set(CMAKE_EXPORT_COMPILE_COMMANDS "ON")

include(3rdParty)

link_directories(lib/)

add_subdirectory(src/)

install(EXPORT ${solutionName} NAMESPACE ${solutionName}_ DESTINATION cmake)

`;

  return template;
}

export function GenerateSrcDirectoryCMakeListsTxt(subprojects: Array<Project>): string {

  let subdirectories = subprojects.map(
    function (dep: Project): string {
      return `add_subdirectory(${dep.name})`;
    }
  ).join('\n');

  return `
${subdirectories}
`;
}

export function GenerateSubprojectCMakeListsTxt(
  solutionName: string,
  project: Project,
  userSubProjects: Array<Project>,
  thirdParty: Array<ThirdPartyProject>): string {

  let dependenciesList: string = thirdParty.map(
    function (dep: ThirdPartyProject): string {
      return dep.name;
    }
  ).concat(
    userSubProjects.map(
      function (userProject: Project): string {
        return userProject.name;
      }
    )
    ).join('\n');

  let includeDirsList: string = thirdParty.map(
    function (dep: ThirdPartyProject): string {
      return `\${${dep.name}_INCLUDE_DIRS}`;
    }
  ).join('\n');

  return `
cmake_minimum_required(VERSION 2.8.11)\n\n

set(TARGET ${project.name})

set(HEADERS
${ project.type !== ProjectType.Executable ?
   `${project.name}.h` : '' }
)

set(SOURCES
  ${ project.type === ProjectType.Executable ?
  'main.cpp': `${project.name}.cpp` }
)

${project.type !== ProjectType.Executable ? `
set(BUILD_TYPE )
set(COMPILE_DEFINITIONS )
option(${project.name}_STATIC "Build ${project.name} as a static library?" ${project.type === ProjectType.StaticLibrary? 'ON': 'OFF'})
if(${project.name}_STATIC)
  set(BUILD_TYPE "STATIC")
  set(COMPILE_DEFINITIONS ${project.name}_STATIC)
else()
  set(BUILD_TYPE "SHARED")
  set(COMPILE_DEFINITIONS ${project.name}_EXPORT)
endif()
`: ''
}

${ project.type == ProjectType.Executable ?
  `add_executable(\${TARGET} \${HEADERS} \${SOURCES})`
  :
  `add_library(\${TARGET} \${BUILD_TYPE} \${HEADERS} \${SOURCES})`
}

target_include_directories(\${TARGET} PUBLIC
${includeDirsList}
)

target_link_libraries(\${TARGET}
${dependenciesList}
)

target_compile_definitions(\${TARGET} PUBLIC
${ project.type !== ProjectType.Executable ?
'\${COMPILE_DEFINITIONS}' : ''
}
)
${ project.type === ProjectType.Executable ?
'set_target_properties(\${TARGET} PROPERTIES COMPILE_FLAGS "/MT" )':
`# If necessary, uncomment the following line and add compiler flags 
# set_target_properties(\${TARGET} PROPERTIES COMPILE_FLAGS )}` }

set_target_properties(\${TARGET} PROPERTIES FOLDER "\${TARGET}")

install(TARGETS \${TARGET}
    EXPORT ${solutionName}
    COMPONENT ${ project.type == ProjectType.Executable ? "bin" : "lib"}
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib/static
)
`;
}


function GenerateExternalProjectAddBeginPartial(thirdParty: ThirdPartyProject) {

  return `
set(SOURCE_DIR \${CMAKE_CURRENT_BINARY_DIR}/${thirdParty.name})
ExternalProject_add(
    ${thirdParty.name}Download
    ${
    thirdParty.sourceType === ThirdPartySource.File ? "URL" :
      thirdParty.sourceType === ThirdPartySource.Git ? "GIT_REPOSITORY" : ""
    }
    ${thirdParty.location}
    SOURCE_DIR \${SOURCE_DIR}`;
}


function GenerateExternalProjectAddEndPartial(
  thirdParty: ThirdPartyProject,
  dependencies: Array<string>): string {

  let projectType: string = "STATIC"
  let extension: string = "a"
  if (thirdParty.type === ProjectType.SharedLibrary) {
    projectType = "SHARED";
    extension = "so";
  }

  let dependenciesString: string = dependencies.join(' ');

  return `
)
set(${thirdParty.name}_BUILD_TYPE ${projectType})
set(PREFIX lib)
set(EXTENSION ${extension})
if(WIN32)
set(PREFIX )
set(EXTENSION lib)
endif()
add_library(${thirdParty.name} \${${thirdParty.name}_BUILD_TYPE} IMPORTED)
add_dependencies(${thirdParty.name} ${thirdParty.name}Download ${dependenciesString})
${ thirdParty.type === ProjectType.Executable ? '' : `
set_target_properties(${thirdParty.name} PROPERTIES
    IMPORTED_LOCATION
        \${THIRD_PARTY_INSTALL_PREFIX}/lib/\${PREFIX}${thirdParty.name}.\${EXTENSION}
)` }
`;
}

export function GenerateCMakeThirdPartyProjectString(
  cmakeProject: CMakeThirdPartyProject,
  dependencies: Array<string>): string {

  let args: string = cmakeProject.cmakeArguments.join('\n');
  let beginPartial: string = GenerateExternalProjectAddBeginPartial(cmakeProject);
  let endPartial: string = GenerateExternalProjectAddEndPartial(cmakeProject, dependencies);
  return `
${beginPartial}
    CMAKE_ARGS
        ${args}
${endPartial}
`;
}

export function GenerateMakeThirdPartyProjectString(
  makeProject: MakeThirdPartyProject,
  dependencies: Array<string>): string {
  let beginPartial: string = GenerateExternalProjectAddBeginPartial(makeProject);
  let endPartial: string = GenerateExternalProjectAddEndPartial(makeProject, dependencies);
  return `
${beginPartial}
    CONFIGURE_COMMAND ${makeProject.configureCommand}
    BUILD_COMMAND ${makeProject.buildCommand}
    INSTALL_COMMAND ${makeProject.installCommand}
${endPartial}
`;
}

function IsCMakeProject(thirdParty: ThirdPartyProject): thirdParty is CMakeThirdPartyProject {
  return (<CMakeThirdPartyProject>thirdParty).cmakeArguments !== undefined;
}

export function GenerateThirdPartyCMakeFile(
  dependencies: Array<ThirdPartyProject>,
  dependenciesMap: Map<number, Array<string>>): string {

  let allDependencyStrings: string = "";

  dependencies.forEach(thirdParty => {
    let thirdPartyDeps: Array<string> = dependenciesMap.get(thirdParty.id);

    if (IsCMakeProject(thirdParty)) {
      allDependencyStrings += GenerateCMakeThirdPartyProjectString(
        <CMakeThirdPartyProject>thirdParty,
        thirdPartyDeps);
    } else {
      allDependencyStrings += GenerateMakeThirdPartyProjectString(
        <MakeThirdPartyProject>thirdParty,
        thirdPartyDeps);
    }
  });

  return `
include(ExternalProject)

set(THIRD_PARTY_INSTALL_PREFIX \${CMAKE_CURRENT_BINARY_DIR}
    CACHE PATH "Directory to install 3rd party dependencies"
)
include_directories(\${THIRD_PARTY_INSTALL_PREFIX}/include)

${allDependencyStrings}
`;

}

export function GenerateExecutableSourceCodeFile(): string {
  return `
#include <iostream>

using namespace std;

int main() {
    cout << "Hello, World!" << endl;
}
`;
}

export function GenerateLibraryHeaderFile(projectName: string): string {
  return `
#pragma once

#ifdef _MSC_VER_ // Compiling with MSVC

#ifdef ${projectName}_EXPORT // Are we building DLLs?
#define API __declspec(dllexport)
#else // Not building DLLs

#ifdef ${projectName}_STATIC // Are we building a static lib?
#define API
#else // Not building a static lib, so we're importing the DLL
#define API __declspec(dllimport)
#endif // API_STATIC

#endif // EXPORT

#else // _MSC_VER_ undefined
#define API
#endif // _MSC_VER

// Standard library dependencies
#include <string>

// Platform-specific includes go here
#ifdef __linux__
// Linux includes

#elif defined(_WIN32)
// Windows includes

#elif defined(__APPLE__)
// Mac includes

#endif // __linux__

API std::string HelloWorld();

`;
}

export function GenerateLibrarySourceFile(projectName: string): string {
  return `
#include "${projectName}.h"
#include <string>

using namespace std;

string HelloWorld() {
    return "Hello, World!";
}
`;
}
