
export enum ProjectType {
    Exectuable,
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
    File,
    Git,
    FindPackage
}

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
