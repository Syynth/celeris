import { basename, resolve } from '@tauri-apps/api/path';
import { readDir, stat } from '@tauri-apps/plugin-fs';
import { TreeDataProvider, TreeItem, TreeItemIndex } from 'react-complex-tree';

import { Project, ProjectReference } from '~/lib/Project';

export class ProjectTreeDataProvider implements TreeDataProvider {
  private path: string;
  private project: Project;
  private basePath: Promise<string>;

  constructor(project: ProjectReference) {
    this.path = project.path;
    this.project = project.project;

    async function computeBasePath() {
      const resolved = await resolve(project.path, '..');
      return resolved;
    }

    this.basePath = computeBasePath();
  }

  public getRootItem = async (): Promise<TreeItem<any>> => {
    const basePath = await this.basePath;
    const entries = await readDir(basePath);
    const children = await Promise.all(
      entries
        .filter(c => !c.name.startsWith('.'))
        .map(async c => await resolve(basePath, c.name)),
    );
    return {
      data: this.project,
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

      console.log('getTreeItem', { itemId, fileInfo });

      const children = fileInfo.isDirectory
        ? await Promise.all(
            (await readDir(itemId)).map(c => resolve(itemId, c.name)),
          )
        : [];

      console.log('children', { children });

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
