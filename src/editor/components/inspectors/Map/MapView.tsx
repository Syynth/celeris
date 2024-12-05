import { AssetRef } from '~/lib/Assets';

interface MapViewProps {
  absolutePath: string;
  asset: AssetRef;
}

export function MapView({ absolutePath, asset }: MapViewProps) {
  return (
    <div>
      MapView {absolutePath} {asset.name}
    </div>
  );
}
