
export enum ProjectType {
    Exectuable = 1,
    SharedLibrary,
    StaticLibrary
}
export const PROJECT_TYPE_TO_NAME: Array<string> = new Array<string>();
PROJECT_TYPE_TO_NAME[ProjectType.Exectuable] = "Executable";
PROJECT_TYPE_TO_NAME[ProjectType.SharedLibrary] = "Shared Library";
PROJECT_TYPE_TO_NAME[ProjectType.StaticLibrary] = "Static Library";


export interface Project {
    id: number;
    name: string;
    type: ProjectType;
}

export enum ThirdPartySource {
    File = 1,
    Git,
    FindPackage
}
export const SOURCE_TYPE_TO_NAME: Array<string> = new Array<string>();
SOURCE_TYPE_TO_NAME[ThirdPartySource.File] = "File URL";
SOURCE_TYPE_TO_NAME[ThirdPartySource.Git] = "Git URL";
SOURCE_TYPE_TO_NAME[ThirdPartySource.FindPackage] = "CMake FindPackage";

export interface ThirdPartyProject extends Project {
    sourceType: ThirdPartySource;
    location: string;
}

export interface CMakeThirdPartyProject extends ThirdPartyProject {
    cmakeArguments : Array<string>;
}

export interface MakeThirdPartyProject extends ThirdPartyProject {
    configureCommand : string;
    buildCommand : string;
    installCommand : string;
}
