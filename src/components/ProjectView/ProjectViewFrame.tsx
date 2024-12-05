import { Tab, Tabs } from '@nextui-org/react';
import { useQuery } from '@tanstack/react-query';
import { resolve } from '@tauri-apps/api/path';
import { Suspense } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { match } from 'ts-pattern';
import {
  useCurrentProjectReference,
  useOpenAssetControls,
  useOpenAssets,
} from '~/contexts/CurrentProject';

import { AssetRef } from '~/lib/Assets';

import { GameView } from './GameView';
import { SpriteView } from './SpriteView';

interface ProjectViewFrameProps {
  isGameRunning: boolean;
}

function ProjectViewTab({ asset }: { asset: AssetRef }) {
  const { path } = useCurrentProjectReference();

  const { data } = useQuery({
    queryKey: ['assetData', asset.id],
    queryFn: async () => await resolve(path, '..', asset.lastKnownPath),
  });

  return (
    <div>
      {data &&
        match(asset)
          .with({ assetType: 'sprite' }, () => (
            <SpriteView absolutePath={data} asset={asset} />
          ))
          .otherwise(() => null)}
    </div>
  );
}

export function ProjectViewFrame({ isGameRunning }: ProjectViewFrameProps) {
  const openAssets = useOpenAssets();
  const { closeAsset } = useOpenAssetControls();

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
          <ProjectViewTab asset={asset} />
        </Tab>
      ))}
    </Tabs>
  );
}
