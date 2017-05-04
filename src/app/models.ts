
export enum ProjectType {
    Exectuable,
    SharedLibrary,
    StaticLibrary
}

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
