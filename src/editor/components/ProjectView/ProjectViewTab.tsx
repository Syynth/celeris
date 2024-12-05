import { useQuery } from '@tanstack/react-query';
import { resolve } from '@tauri-apps/api/path';
import { match } from 'ts-pattern';
import { useCurrentProjectReference } from '~/contexts/CurrentProject';

import { AssetRef } from '~/lib/Assets';

import { InkView } from '../inspectors/Ink';
import { MachineView } from '../inspectors/Machine';
import { MapView } from '../inspectors/Map';
import { SpriteView } from '../inspectors/Sprite';

interface ProjectViewTabProps {
  asset: AssetRef;
}

export function ProjectViewTab({ asset }: ProjectViewTabProps) {
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
          .with({ assetType: 'map' }, () => (
            <MapView absolutePath={data} asset={asset} />
          ))
          .with({ assetType: 'machine' }, () => (
            <MachineView absolutePath={data} asset={asset} />
          ))
          .otherwise(() => null)}
    </div>
  );
}
