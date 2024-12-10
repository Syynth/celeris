import { ProjectData } from './ProjectData';

export class ProjectLibrary {
  private constructor(assets: ProjectData['library']) {}

  static fromData(data: ProjectData): ProjectLibrary {
    return new ProjectLibrary(data.library);
  }
}
