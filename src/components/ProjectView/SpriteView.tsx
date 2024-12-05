import { useQuery } from '@tanstack/react-query';
import { readFile } from '@tauri-apps/plugin-fs';
import { useRef } from 'react';

import { AssetRef } from '~/lib/Assets';

interface SpriteViewProps {
  absolutePath: string;
  asset: AssetRef;
}

export function SpriteView({ asset, absolutePath }: SpriteViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const { data } = useQuery({
    queryKey: ['spriteView', asset.id],
    queryFn: async () => {
      try {
        const data = await readFile(absolutePath);
        console.log('data!', { data });
        const blob = new Blob([data], { type: 'image/png' }); // Adjust the type accordingly
        if (imgRef.current) {
          imgRef.current.src = URL.createObjectURL(blob);
        }
        return URL.createObjectURL(blob);
      } catch (err) {
        console.error(err);
      }
    },
  });

  return (
    <div className="h-full w-full p-2">
      <img
        style={{
          imageRendering: 'pixelated',
        }}
        ref={imgRef}
        src={data}
      />
    </div>
  );
}
