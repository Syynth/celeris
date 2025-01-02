import { Tab, Tabs } from '@nextui-org/react';
import { Suspense, useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { IoCloseSharp } from 'react-icons/io5';

import { GameView } from '~/editor/components/GameView';
import {
  useAssetListener,
  useOpenAssetControls,
  useOpenAssets,
} from '~/editor/contexts/Assets';

import { ProjectViewTab } from './ProjectViewTab';

interface ProjectViewFrameProps {
  isGameRunning: boolean;
}

export function ProjectViewFrame({ isGameRunning }: ProjectViewFrameProps) {
  const openAssets = useOpenAssets();
  const { closeAsset } = useOpenAssetControls();

  const [selected, setSelected] = useState<string | null>(
    openAssets.at(0)?.id ?? null,
  );

  useAssetListener((assetId, openAssets) => {
    if (openAssets.includes(assetId)) {
      setSelected(assetId);
    } else if (selected === assetId) {
      setSelected(openAssets.at(0) ?? null);
    }
  });

  useHotkeys(
    'ctrl+w',
    () => {
      if (selected) {
        closeAsset(selected);
      }
    },
    { preventDefault: true },
  );

  const handleSelect = useCallback((key: string | number) => {
    setSelected(key.toString());
  }, []);

  if (isGameRunning) {
    return (
      <Suspense fallback={<div>loading...</div>}>
        <GameView />
      </Suspense>
    );
  }

  if (openAssets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-2xl">Open an asset to get started</div>
      </div>
    );
  }

  return (
    <Tabs
      selectedKey={selected}
      onSelectionChange={handleSelect}
      variant="solid"
      size="sm"
      aria-label="Open Assets"
      items={openAssets}
    >
      {openAssets.map(asset => (
        <Tab
          key={asset.id}
          className="group h-full"
          title={
            <div className="p-x-10 p-y-0 flex h-4 flex-row items-center">
              <div className="mr-8" />
              <div>{asset.name}</div>
              <div
                onClick={() => closeAsset(asset.id)}
                className="ml-4 opacity-0 group-hover:opacity-100"
              >
                <IoCloseSharp />
              </div>
            </div>
          }
        >
          <ProjectViewTab asset={asset} />
        </Tab>
      ))}
    </Tabs>
  );
}
