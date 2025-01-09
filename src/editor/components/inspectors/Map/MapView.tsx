import { AssetRef } from '~/lib/Assets';

interface MapViewProps {
  absolutePath: string;
  asset: AssetRef;
}

export function MapView({ absolutePath, asset }: MapViewProps) {
  return (
    <pre>
      MapView {absolutePath}
      <br />
      {JSON.stringify(asset, null, 2)}
    </pre>
  );
}
