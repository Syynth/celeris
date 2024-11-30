import { TreeDataProvider, TreeItem, TreeItemIndex } from 'react-complex-tree';

import { Project } from '~/lib/Project';

export class ProjectTreeDataProvider implements TreeDataProvider {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  private toTreeItem<Asset extends { id: string; path: string; name: string }>(
    asset: Asset,
  ): TreeItem<Asset> {
    return {
      canMove: false,
      canRename: false,
      children: [],
      isFolder: false,
      data: asset,
      index: asset.path,
    };
  }

  getTreeItem: (itemId: TreeItemIndex) => Promise<TreeItem<any>> =
    async itemId => {
      const item = this.project.assets.sprites.find(
        sprite => sprite.id === itemId,
      );
      if (item) return this.toTreeItem(item);
      return null!;
    };
}
