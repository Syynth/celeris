import { basename, resolve } from '@tauri-apps/api/path';
import { readDir, stat } from '@tauri-apps/plugin-fs';
import { TreeDataProvider, TreeItem, TreeItemIndex } from 'react-complex-tree';

import { getProjectDirectory } from '~/lib/Assets';
import { ProjectReference } from '~/lib/Project';

export class ProjectTreeDataProvider implements TreeDataProvider {
  private path: string;
  private basePath: Promise<string>;

  constructor(project: ProjectReference) {
    this.path = project.path;
    this.basePath = getProjectDirectory(project);
  }

  public getRootItem = async (): Promise<TreeItem<any>> => {
    const basePath = await this.basePath;
    const entries = await readDir(basePath);
    const children = await Promise.all(
      entries
        .filter(c => !c.name.startsWith('.') && !c.name.endsWith('.meta'))
        .map(async c => await resolve(basePath, c.name)),
    );
    return {
      data: {
        name: await basename(basePath),
      },
      index: this.path,
      isFolder: false,
      canMove: false,
      canRename: false,
      children,
    };
  };

  getTreeItem: (itemId: TreeItemIndex) => Promise<TreeItem<any>> =
    async itemId => {
      if (itemId === this.path) return this.getRootItem();
      if (typeof itemId === 'number') {
        return null!;
      }

      const fileInfo = await stat(itemId);

      const children = fileInfo.isDirectory
        ? (
            await Promise.all(
              (await readDir(itemId))
                .filter(c => c.isDirectory || !c.name.endsWith('.meta'))
                .map(c => resolve(itemId, c.name)),
            )
          ).filter(c => c)
        : [];

      return {
        index: itemId,
        canMove: false,
        isFolder: fileInfo.isDirectory,
        children,
        data: {
          name: await basename(itemId),
        },
        canRename: false,
      };
    };
}
