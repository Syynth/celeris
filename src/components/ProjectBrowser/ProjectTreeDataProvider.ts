import { TreeDataProvider, TreeItem, TreeItemIndex } from 'react-complex-tree';

import { Project, assetById } from '~/lib/Project';

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
      index: asset.id,
    };
  }

  public getRootItem = async (): Promise<TreeItem<any>> => {
    return {
      data: this.project,
      index: 'root',
      isFolder: false,
      canMove: false,
      canRename: false,
      children: Object.keys(this.project.assets),
    };
  };

  getTreeItem: (itemId: TreeItemIndex) => Promise<TreeItem<any>> =
    async itemId => {
      console.log('getTreeItem', { itemId });
      if (itemId === 'root') return this.getRootItem();
      if (typeof itemId === 'number') {
        return null!;
      }

      if (itemId in this.project.assets) {
        return {
          index: itemId,
          canMove: false,
          isFolder: true,
          children: this.project.assets[itemId as keyof Project['assets']].map(
            asset => asset.id,
          ),
          data: {
            name: itemId.charAt(0).toUpperCase() + itemId.slice(1),
          },
          canRename: false,
        };
      }

      const asset = assetById(this.project, itemId);

      console.log('found asset:', { asset });
      if (asset) {
        return this.toTreeItem(asset);
      }

      return null!;
    };
}
