import { ProjectData } from './ProjectData';

export class ProjectLibrary {
  private constructor(
    private assets: ProjectData['library'],
    private libraryDir: string,
  ) {}

  static fromData(data: ProjectData, path: string): ProjectLibrary {
    return new ProjectLibrary(data.library, path);
  }
}
