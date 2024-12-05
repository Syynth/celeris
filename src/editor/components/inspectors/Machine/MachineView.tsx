import { AssetRef } from '~/lib/Assets';

interface MachineViewProps {
  absolutePath: string;
  asset: AssetRef;
}

export function MachineView({ absolutePath, asset }: MachineViewProps) {
  return (
    <div>
      MachineView {absolutePath} {asset.name}
    </div>
  );
}
