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
import { InkView } from '~/components/Editor/Ink/InkView';
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
    <div className="h-full">
      {data &&
        match(asset)
          .with({ assetType: 'sprite' }, () => (
            <SpriteView absolutePath={data} asset={asset} />
          ))
          .with({ assetType: 'ink' }, () => (
            <InkView absolutePath={data} asset={asset} />
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
          className="group h-full"
          title={
            <div className="p-x-10 p-y-0 flex h-4 flex-row items-center">
              <div>{asset.name}</div>
              {openAssets.length > 1 && (
                <div
                  onClick={() => closeAsset(asset.id)}
                  className="absolute right-0 opacity-0 group-hover:opacity-100"
                >
                  <IoCloseSharp />
                </div>
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
