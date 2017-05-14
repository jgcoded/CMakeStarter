
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
# Sets the minimum required version of CMake needed to process this file.
cmake_minimum_required(VERSION 2.8.11)

# This command sets the name for the entire project.
project(${solutionName})

# These commands define variables that are used throughout other CMake files in this project.
set(${solutionName}_ROOT \${CMAKE_CURRENT_LIST_DIR})
set(${solutionName}_BIN_DIR \${${solutionName}_ROOT}/bin)
set(${solutionName}_LIB_DIR \${${solutionName}_ROOT}/lib)
set(${solutionName}_CMAKE_DIR \${${solutionName}_ROOT}/cmake)
set(${solutionName}_SUBMODULES_DIR \${${solutionName}_ROOT}/submodules)

# Change where CMake should output compiled libraries and executables.
# This is based on preference, so these set() commands should be changed
# or removed.
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY \${${solutionName}_LIB_DIR})
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY \${${solutionName}_BIN_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY \${${solutionName}_BIN_DIR})

# Set the C++ standard version to C++11. On older versions of CMake the
# CMAKE_CXX_FLAGS must be changed instead.
set(CMAKE_CXX_STANDARD 11)
if(\${CMAKE_MAJOR_VERSION}.\${CMAKE_MINOR_VERSION} LESS 3.1)
    set(CMAKE_CXX_FLAGS "\${CMAKE_CXX_FLAGS} -std=c++11")
endif()

# Use solution folders. In Visual Studio this will place a solution within a folder.
set_property(GLOBAL PROPERTY USE_FOLDERS ON)
# Auto-generated files are placed in a "Generated" folder.
set_property(GLOBAL PROPERTY AUTOGEN_TARGETS_FOLDER "Generated")

# Export the commands CMake used to compile the project. This is useful for tools
# like Vim's YouCompleteMe.
set(CMAKE_EXPORT_COMPILE_COMMANDS "ON")

# Search for CMake files in the cmake/ directory as well
set(CMAKE_MODULE_PATH \${CMAKE_MODULE_PATH} \${${solutionName}_CMAKE_DIR})

# This command will load and run CMake code in the 3rdParty.cmake file within
# the cmake/ folder. CMake is able to find this file because the
# CMAKE_MODULE_PATH variable was changed to include the cmake/ folder.
include(3rdParty)

# Specify to include the lib/ folder in the paths the linker should look for
# libraries. This command is usually not necessary.
link_directories(lib/)

# Adds the src/ directory to the build. This command expects that the src/
# subdirectory contains a CMakeLists.txt file. CMake processes that file
# before continuing processing this file.
add_subdirectory(src/)

# When installing, this command will place a .cmake file within the cmake/
# directory where the project will be installed. This .cmake file can be
# used by an outside project to reference the targets within this project
# as if the outside project were building this project from its own build
# tree.
#
# The outside project just has to include the .cmake file using the include()
# command, and then it can reference the targets defined in this project
# with a concatenation of the namespace and target name.
#
# For example, if this project builds a library foo, and the namespace is
# myproj, then the outside project can reference the library using myproj_foo
# in its CMake code.
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
# This file is used to add all the subprojects to the build tree. The order
# in which the projects are added matters. Place all dependencies before
# parent projects.

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
      return `    ${dep.name}`;
    }
  ).concat(
    userSubProjects.map(
      function (userProject: Project): string {
        return `    ${userProject.name}`;
      }
    )
    ).join('\n');

  let includeDirsList: string = thirdParty.map(
    function (dep: ThirdPartyProject): string {
      return `    \${${dep.name}_INCLUDE_DIRS}`;
    }
  ).join('\n');

  return `
cmake_minimum_required(VERSION 2.8.11)

# This variable is used to make it easy to copy-paste this entire file for
# use in another project.
set(TARGET ${project.name})

# All header files should go here.
set(HEADERS
    ${ project.type !== ProjectType.Executable ?
   `${project.name}.h` : '' }
)

# All source files should go here.
set(SOURCES
    ${ project.type === ProjectType.Executable ?
    'main.cpp': `${project.name}.cpp` }
)

${project.type !== ProjectType.Executable ? `
# This option allows the builder to decide if this project should be built
# as a static library or a shared library.
option(${project.name}_STATIC "Build ${project.name} as a static library?" ${project.type === ProjectType.StaticLibrary? 'ON': 'OFF'})
set(BUILD_TYPE )
set(COMPILE_DEFINITIONS )
# Set variables to their appriate values
if(${project.name}_STATIC)
  set(BUILD_TYPE "STATIC")
  # Add any other static library specific compiler preprocessor flags here.
  set(COMPILE_DEFINITIONS ${project.name}_STATIC)
else()
  set(BUILD_TYPE "SHARED")
  # Add any other shared library specific compiler preprocessor flags here. 
  set(COMPILE_DEFINITIONS ${project.name}_EXPORT)
endif()
`: ''
}

${ project.type == ProjectType.Executable ?
  `# Add the executable to the build using the headers and sources.
add_executable(\${TARGET} \${HEADERS} \${SOURCES})`
  :
  `# Add the library to the build the headers and sources.
add_library(\${TARGET} \${BUILD_TYPE} \${HEADERS} \${SOURCES})`
}

# Add include directories here.
target_include_directories(\${TARGET} PUBLIC
${includeDirsList}
)

# Add depenency libraries or CMake targets here.
target_link_libraries(\${TARGET}
${dependenciesList}
)

# Add project-specific compiler preprocessor variables here.
target_compile_definitions(\${TARGET} PUBLIC
${ project.type !== ProjectType.Executable ?
'\${COMPILE_DEFINITIONS}' : ''
}
)

# Add compiler flags here.
set_target_properties(\${TARGET} PROPERTIES COMPILE_FLAGS "")

# When using an MSVC compiler (Used by Visual Studio), link the
# C Runtime Library as a static library.
if(MSVC)
  set_target_properties(\${TARGET} PROPERTIES LINK_FLAGS "/MT" )
endif()

# Place this target into its own solution folder.
set_target_properties(\${TARGET} PROPERTIES FOLDER "\${TARGET}")

# Add this project to the list of installed targets. When the install command
# is invoked, this project will be placed in the installation directory. The
# EXPORT part of this commands will cause CMake to allow this target to
# be used by outside projects.
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

  return `set(SOURCE_DIR \${CMAKE_CURRENT_BINARY_DIR}/${thirdParty.name})
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
# NOTE: You may have to change the path specified after IMPORTED_LOCATION if you get
# a linker error.
set_target_properties(${thirdParty.name} PROPERTIES
    IMPORTED_LOCATION
        \${THIRD_PARTY_INSTALL_PREFIX}/lib/\${PREFIX}${thirdParty.name}.\${EXTENSION}
)` }
`;
}

export function GenerateCMakeThirdPartyProjectString(
  cmakeProject: CMakeThirdPartyProject,
  dependencies: Array<string>): string {

  let args: string = cmakeProject.cmakeArguments.join('\n\t\t');
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
# This CMake file is used to download and build the third party dependencies
# needed by this project. It is possible to obtain depencies from an archive
# file, a git, mercurial, or even an svn repository, and these dependent
# projects can either have CMake-based or script-based builds.
#
# To support all of that, this file uses CMake's ExternalProject module. This
# provides a highly configurable way to obtain third party dependencies.
#
# For more advanced configuration options see
# https://cmake.org/cmake/help/latest/module/ExternalProject.html
#
# The one shortcoming from this method is that it expects to the third
# party dependency library to be in a specific location and have a specific
# name. You will know this is the case because you will get a linker error
# when buildng the project.
#
# Fortunately, the fix is easy: just change the path that comes after
# IMPORTED_LOCATION for the library that produced the linker error.

include(ExternalProject)

# Set the installation prefix of all third party dependencies. After a build,
# the libraries, include directories, and executables of all third party
# projects will be placed in this directory.
set(THIRD_PARTY_INSTALL_PREFIX \${CMAKE_CURRENT_BINARY_DIR}
    CACHE PATH "Directory to install 3rd party dependencies"
)

# Add the include/ subdirectory of the third party installation directory
# to the list of directories to search for header files. This directory will
# exist after the third party dependencies are built.
include_directories(\${THIRD_PARTY_INSTALL_PREFIX}/include)

# Third party dependencies start after this line. They are ordered so that
# dependencies of parent projects appear first in the file.

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
