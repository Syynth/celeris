import { basename, resolve } from '@tauri-apps/api/path';
import {
  WatchEvent,
  WatchEventKindAccess,
  WatchEventKindCreate,
  WatchEventKindModify,
  WatchEventKindRemove,
  readDir,
  stat,
  watch,
} from '@tauri-apps/plugin-fs';
import { TreeDataProvider, TreeItem, TreeItemIndex } from 'react-complex-tree';
import { P, match } from 'ts-pattern';

import { getProjectDirectory } from '~/lib/Assets';
import { ProjectReference } from '~/lib/Project';

export class ProjectTreeDataProvider implements TreeDataProvider {
  // @ts-ignore
  private project: ProjectReference;
  private readonly path: string;
  private readonly basePath: Promise<string>;
  private watching: boolean = false;

  private treeChangeListeners: ((itemIds: TreeItemIndex[]) => void)[] = [];
  cache: Map<TreeItemIndex, TreeItem<any>> = new Map();

  constructor(project: ProjectReference) {
    this.project = project;
    this.path = project.path;
    this.basePath = getProjectDirectory(project);
  }

  public beginFsWatch = () => {
    if (this.watching) return async () => {};
    this.watching = true;
    const unwatch = this.basePath.then(path => {
      console.log('attaching watch to', { path });
      return watch(
        path,
        async ({ attrs, paths, type }: WatchEvent) => {
          match(type)
            .with('any', () => {
              console.log('Any:', { paths, attrs });
            })
            .with('other', () => {
              console.log('Other:', { paths, attrs });
            })
            .with({ access: P.nonNullable }, ({ access }) =>
              this.handleAccessEvent(access, paths, attrs),
            )
            .with({ create: P.nonNullable }, ({ create }) =>
              this.handleCreateEvent(create, paths, attrs),
            )
            .with({ modify: P.nonNullable }, ({ modify }) =>
              this.handleModifyEvent(modify, paths, attrs),
            )
            .with({ remove: P.nonNullable }, ({ remove }) =>
              this.handleRemoveEvent(remove, paths, attrs),
            )
            .exhaustive();
        },
        { recursive: true },
      );
    });

    return async () => {
      const u = await unwatch;
      this.watching = false;
      u();
    };
  };

  private async handleAccessEvent(
    access: WatchEventKindAccess,
    paths: string[],
    attrs: unknown,
  ) {
    match(access)
      .with({ kind: 'open' }, access => {
        console.log('Accessed open:', { access, paths, attrs });
      })
      .with({ kind: 'close' }, access => {
        console.log('Accessed close:', { access, paths, attrs });
      })
      .with({ kind: 'any' }, access => {
        console.error('Unknown WatchEventKindAccess:', {
          access,
          paths,
          attrs,
        });
      })
      .with({ kind: 'other' }, access => {
        console.log('Accessed other:', { access, paths, attrs });
      })
      .exhaustive();
  }

  private async handleCreateEvent(
    create: WatchEventKindCreate,
    paths: string[],
    attrs: unknown,
  ) {
    match(create)
      .with({ kind: 'file' }, create => {
        console.log('Created file:', { create, paths, attrs });
      })
      .with({ kind: 'folder' }, create => {
        console.log('Created dir:', { create, paths, attrs });
      })
      .with({ kind: 'any' }, create => {
        console.log('Created any', { create, paths, attrs });
      })
      .with({ kind: 'other' }, create => {
        console.log('Created other:', { create, paths, attrs });
      })
      .exhaustive();
  }

  private async handleModifyEvent(
    modify: WatchEventKindModify,
    paths: string[],
    attrs: unknown,
  ) {
    match(modify)
      .with({ kind: 'any' }, modify => {
        console.log('Modified any:', { modify, paths, attrs });
      })
      .with({ kind: 'other' }, modify => {
        console.log('Modified other:', { modify, paths, attrs });
      })
      .with({ kind: 'data' }, modify => {
        console.log('Modified data:', { modify, paths, attrs });
      })
      .with({ kind: 'metadata' }, modify => {
        console.log('Modified metadata:', { modify, paths, attrs });
      })
      .with({ kind: 'rename' }, modify => {
        console.log('Modified rename:', { modify, paths, attrs });
        this.treeChangeListeners.forEach(l => l(paths));
      })
      .exhaustive();
  }

  private async handleRemoveEvent(
    remove: WatchEventKindRemove,
    paths: string[],
    attrs: unknown,
  ) {
    match(remove)
      .with({ kind: 'file' }, remove => {
        console.log('Removed file:', { remove, paths, attrs });
      })
      .with({ kind: 'folder' }, remove => {
        console.log('Removed folder:', { remove, paths, attrs });
      })
      .with({ kind: 'any' }, remove => {
        console.log('Removed any:', { remove, paths, attrs });
      })
      .with({ kind: 'other' }, remove => {
        console.log('Removed other:', { remove, paths, attrs });
      })
      .exhaustive();
  }

  public onDidChangeTreeData: TreeDataProvider['onDidChangeTreeData'] =
    listener => {
      this.treeChangeListeners.push(listener);
      return {
        dispose: () => {
          this.treeChangeListeners.splice(
            this.treeChangeListeners.indexOf(listener),
            1,
          );
        },
      };
    };

  public onRenameItem: TreeDataProvider['onRenameItem'] = async (
    item,
    name,
  ) => {
    if (item.isFolder) {
      console.error('Cant rename folders yet!');
      return;
    }

    const itemId = item.data.meta.id;
    const cacheItem = this.cache.get(itemId);
    if (cacheItem?.data) {
      cacheItem.data.name = name;
    }
    return;
    // const path = await renameAsset(this.project, asset, name);
    this.treeChangeListeners.forEach(l => l([item.index, name]));
  };

  public getRootItem = async (): Promise<TreeItem<any>> => {
    const basePath = await this.basePath;
    const entries = await readDir(basePath);
    const children = await Promise.all(
      entries
        .filter(
          c =>
            !c.name.startsWith('.') &&
            !c.name.endsWith('.meta') &&
            !c.name.endsWith('.celeris'),
        )
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

  public getTreeItem: TreeDataProvider['getTreeItem'] = async itemId => {
    const cached = this.cache.get(itemId);
    if (cached) {
      return cached;
    }
    const item = await this.getTreeItemImpl(itemId);
    this.cache.set(itemId, item);
    return item;
  };

  getTreeItemSync: (itemId: TreeItemIndex) => TreeItem | null = itemId =>
    this.cache.get(itemId) ?? null;

  private getTreeItemImpl: TreeDataProvider['getTreeItem'] = async itemId => {
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
      canRename: true,
    } as TreeItem<any>;

    if (fileInfo.isFile) {
      try {
        const metaInfo = await stat(itemId + '.meta');
        if (metaInfo?.isFile) {
          baseItem.data.meta = baseItem.data.meta ?? {};
          baseItem.data.meta.id = itemId;
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
