

interface Storable {
  id: number;
}

export interface Executable extends Storable {
  kind: 'executable';
  name: string;
}

export interface Library extends Storable {
  kind: 'library';
  name: string;
  isStaticLibrary: boolean;
}

export enum VersionControlSystem {
  Git,
  SVN,
  Mercurial,
  CVS
}

export interface VersionControlSource {
  kind: 'vcs';
  versionControlSystem: VersionControlSystem;
  repoUrl: string;
}

export interface FileSource {
  kind: 'file';
  fileUrl: string;
}

export interface FindPackageSource {
  kind: 'findpackage';
  package: CMakePackage;
  version?: string;
  exact?: boolean;
  quiet?: boolean;
  module?: boolean;
  required?: boolean;
  components?: Array<string>;
  optionalComponents?: Array<string>;
  noPolicyScope?: boolean;
}

export type ThirdPartySource = FileSource | VersionControlSource | FindPackageSource;

export interface MakeBuildTool {
  kind: 'make';
  configureCommand: string;
  buildCommand: string;
  installCommand: string;
}

export interface CMakeBuildTool {
  kind: 'cmake';
  cmakeArguments: Array<string>;
}

export type BuildTool = CMakeBuildTool | MakeBuildTool;

export interface ThirdPartyLibrary {
  name: string;
  isStaticLibrary: boolean;
  outputDirectory: string;
}

// third party projects can produce either shared or static libs
export interface ThirdPartyProject extends Storable {
  kind: 'thirdparty';
  name: string;
  source: ThirdPartySource;
  buildTool?: BuildTool;
  libraryOutputs?: Array<ThirdPartyLibrary>;
}

export type UserProject = Executable | Library;
export type Project = UserProject | ThirdPartyProject;

export enum CMakePackage {
  ALSA,
  Armadillo,
  ASPELL,
  AVIFile,
  Backtrace,
  BISON,
  BLAS,
  Boost,
  Bullet,
  CABLE,
  CUDA,
  Cups,
  CURL,
  Curses,
  CVS,
  CxxTest,
  Cygwin,
  Dart,
  DCMTK,
  DevIL,
  Doxygen,
  EXPAT,
  FLEX,
  FLTK,
  Freetype,
  GCCXML,
  GDAL,
  Gettext,
  GIF,
  Git,
  GLEW,
  GLU,
  GLUT,
  Gnuplot,
  GnuTLS,
  GSL,
  GTest,
  GTK,
  Hg,
  HSPELL,
  HTMLHelp,
  Ice,
  Icotool,
  ImageMagick,
  Intl,
  Jasper,
  Java,
  JNI,
  JPEG,
  LAPACK,
  LATEX,
  LibArchive,
  LibLZMA,
  LibXslt,
  Lua,
  Matlab,
  MFC,
  Motif,
  MPEG,
  MPI,
  OpenAL,
  OpenCL,
  OpenGL,
  OpenMP,
  OpenSceneGraph,
  OpenSSL,
  OpenThreads,
  osgAnimation,
  osg,
  osgDB,
  osgFX,
  osgGA,
  osgIntrospection,
  osgManipulator,
  osgParticle,
  osgPresentation,
  osgProducer,
  osgQt,
  osgShadow,
  osgSim,
  osgTerrain,
  osgText,
  osgUtil,
  osgViewer,
  osgVolume,
  osgWidget,
  PackageHandleStandardArgs,
  PackageMessage,
  Perl,
  PerlLibs,
  PhysFS,
  Pike,
  PkgConfig,
  PNG,
  PostgreSQL,
  Producer,
  Protobuf,
  PythonInterp,
  PythonLibs,
  Qt,
  QuickTime,
  RTI,
  Ruby,
  SDL,
  SelfPackers,
  Squish,
  Subversion,
  SWIG,
  TCL,
  Tclsh,
  TclStub,
  Threads,
  TIFF,
  UnixCommands,
  Wget,
  Wish,
  wxWidgets,
  wxWindows,
  XalanC,
  XCTest,
  XercesC,
  XMLRPC,
  ZLIB
}
const keys = Object.keys(CMakePackage);
export const CMAKE_PACKAGE_TO_NAME: Array<string> = keys.splice(keys.length/2);



