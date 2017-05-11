
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
)

set(SOURCES
)

${ project.type == ProjectType.Exectuable ?
            `add_executable(\${TARGET} \${HEADERS} \${SOURCES})`
            : project.type == ProjectType.SharedLibrary ?
                `add_library(\${TARGET} SHARED \${HEADERS} \${SOURCES})`
                : project.type == ProjectType.StaticLibrary ?
                    `add_library(\${TARGET} STATIC \${HEADERS} \${SOURCES})`
                    : ""
        }

target_include_directories(\${TARGET} PUBLIC
${includeDirsList}
)

target_link_libraries(\${TARGET}
${dependenciesList}
)

target_compile_definitions(\${TARGET} PUBLIC

)

set_target_properties(\${TARGET} PROPERTIES FOLDER "\${TARGET}")

install(TARGETS \${TARGET}
    EXPORT ${solutionName}
    COMPONENT ${ project.type == ProjectType.Exectuable ? "bin" : "lib"}
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
    if (thirdParty.type == ProjectType.SharedLibrary) {
        projectType = "SHARED";
        extension = "so";
    }

    let dependenciesString: string = dependencies.join(' ');

    return `
)
add_library(${thirdParty.name} ${projectType} IMPORTED)
add_dependencies(${thirdParty.name} ${thirdParty.name}Download ${dependenciesString})
set_target_properties(${thirdParty.name} PROPERTIES
    IMPORTED_LOCATION
        \${THIRD_PARTY_INSTALL_PREFIX}/lib/lib${thirdParty.name}.${extension}
)`;
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
        -DCMAKE_BUILD_TYPE=\${CMAKE_BUILD_TYPE}
        -DCMAKE_INSTALL_PREFIX=\${THIRD_PARTY_INSTALL_PREFIX}
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
