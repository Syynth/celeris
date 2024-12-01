import { Tab, Tabs } from '@nextui-org/react';
import { IoCloseSharp } from 'react-icons/io5';
import {
  useCurrentProject,
  useOpenAssetControls,
  useOpenAssetIds,
} from '~/contexts/CurrentProject';

import { assetById } from '~/lib/Project';

interface ProjectViewFrameProps {}

export function ProjectViewFrame({}: ProjectViewFrameProps) {
  const project = useCurrentProject();
  const { closeAsset } = useOpenAssetControls();
  const openAssets = useOpenAssetIds()
    .map(assetId => assetById(project, assetId))
    .filter(asset => asset !== null) as {
    id: string;
    name: string;
  }[];

  return (
    <Tabs variant="solid" size="sm" aria-label="Open Assets" items={openAssets}>
      {openAssets.map(asset => (
        <Tab
          key={asset.id}
          className="group"
          title={
            <div className="p-y-0 flex flex-row items-center p-6">
              <div>{asset.name}</div>
              <button
                onClick={() => closeAsset(asset.id)}
                className="absolute right-0 opacity-0 group-hover:opacity-100"
              >
                <IoCloseSharp />
              </button>
            </div>
          }
        >
          <div className="p-2">{asset.name}</div>
        </Tab>
      ))}
    </Tabs>
  );
}
