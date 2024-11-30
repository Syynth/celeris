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
            asset => asset.path,
          ),
          data: {
            name: itemId.charAt(0).toUpperCase() + itemId.slice(1),
          },
          canRename: false,
        };
      }

      const [assetType, ...path] = itemId.split('/');
      if (path.length === 0) {
        return null!;
      }
      const assetId = [assetType, ...path].join('/');

      const asset = this.project.assets[
        assetType as keyof Project['assets']
      ].find(asset => asset.path === assetId);

      console.log({ asset, assetId, itemId, path });

      if (asset) {
        return this.toTreeItem(asset);
      }

      return null!;
    };
}
