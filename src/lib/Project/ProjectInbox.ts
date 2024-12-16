import { resolve } from '@tauri-apps/api/path';
import { mkdir } from '@tauri-apps/plugin-fs';

import { AssetWatcher } from './AssetWatcher';
import { ProjectData, VirtualFolderStructure } from './ProjectData';

export class ProjectInbox {
  private constructor(
    private data: ProjectData,
    private path: string,
    private watcher: AssetWatcher,
  ) {}

  static fromPath(data: ProjectData, path: string): ProjectInbox {
    return new ProjectInbox(data, path, new AssetWatcher(path));
  }

  watch() {
    return this.watcher.watch();
  }

  public async constructInboxDirectories() {
    await mkdir(this.path);
    this.data.library.structure;
  }

  private async constructVirtualFolder(
    parentDir: string,
    folder: VirtualFolderStructure,
  ) {
    if (folder.type === 'asset') return;
    const folderName = await resolve(parentDir, folder.displayName);
    await mkdir(folderName);
    await Promise.all(
      folder.children.map(child =>
        this.constructVirtualFolder(folderName, child),
      ),
    );
  }
}
