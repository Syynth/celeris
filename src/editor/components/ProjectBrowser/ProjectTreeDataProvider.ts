import { basename, resolve } from '@tauri-apps/api/path';
import { readDir, readTextFile, stat } from '@tauri-apps/plugin-fs';
import { TreeDataProvider, TreeItem, TreeItemIndex } from 'react-complex-tree';

import { getProjectDirectory } from '~/lib/Assets';
import { ProjectReference } from '~/lib/Project';

export class ProjectTreeDataProvider implements TreeDataProvider {
  private path: string;
  private basePath: Promise<string>;

  private cache: Map<TreeItemIndex, TreeItem<any>> = new Map();

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
      const cached = this.cache.get(itemId);
      if (cached) {
        return cached;
      }
      const item = await this.getTreeItemImpl(itemId);
      this.cache.set(itemId, item);
      return item;
    };

  getTreeItemSync: (itemId: TreeItemIndex) => TreeItem<any> | null = itemId =>
    this.cache.get(itemId) ?? null;

  private getTreeItemImpl: (itemId: TreeItemIndex) => Promise<TreeItem<any>> =
    async itemId => {
      if (itemId === this.path) return this.getRootItem();
      if (typeof itemId === 'number') {
        return null!;
      }

      const fileInfo = await stat(itemId);

      const baseItem = {
        index: itemId,
        canMove: false,
        isFolder: fileInfo.isDirectory,
        data: {
          name: await basename(itemId),
          meta: null,
        },
        children: [],
        canRename: false,
      } as TreeItem<any>;

      if (fileInfo.isFile) {
        try {
          const metaInfo = await stat(itemId + '.meta');
          if (metaInfo?.isFile) {
            const metaJson = await readTextFile(itemId + '.meta');
            baseItem.data.meta = JSON.parse(metaJson);
          }
        } catch {
          return baseItem;
        }
      }

      const children = fileInfo.isDirectory
        ? (
            await Promise.all(
              (await readDir(itemId))
                .filter(c => c.isDirectory || !c.name.endsWith('.meta'))
                .map(c => resolve(itemId, c.name)),
            )
          ).filter(c => c)
        : [];

      baseItem.children = children;

      return baseItem;
    };
}
