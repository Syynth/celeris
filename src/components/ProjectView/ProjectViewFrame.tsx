import { Tab, Tabs } from '@nextui-org/react';
import { Suspense } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { useOpenAssetControls, useOpenAssets } from '~/contexts/CurrentProject';

import { GameView } from './GameView';

interface ProjectViewFrameProps {
  isGameRunning: boolean;
}

export function ProjectViewFrame({ isGameRunning }: ProjectViewFrameProps) {
  const { closeAsset } = useOpenAssetControls();
  const openAssets = useOpenAssets();

  if (isGameRunning) {
    return (
      <Suspense fallback={<div>loading...</div>}>
        <GameView />
      </Suspense>
    );
  }

  return (
    <Tabs variant="solid" size="sm" aria-label="Open Assets" items={openAssets}>
      {openAssets.map(asset => (
        <Tab
          key={asset.id}
          className="group"
          title={
            <div className="p-y-0 flex flex-row items-center p-6">
              <div>{asset.name}</div>
              {openAssets.length > 1 && (
                <button
                  onClick={() => closeAsset(asset.id)}
                  className="absolute right-0 opacity-0 group-hover:opacity-100"
                >
                  <IoCloseSharp />
                </button>
              )}
            </div>
          }
        >
          <div className="p-2">{asset.name}</div>
        </Tab>
      ))}
    </Tabs>
  );
}
