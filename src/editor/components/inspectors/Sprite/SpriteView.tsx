import { Center, Group, IconButton, Image } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { readFile } from '@tauri-apps/plugin-fs';
import { useRef, useState } from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';
import { Button } from '~/components/ui/button.tsx';

import { AssetRef } from '~/lib/Assets';

interface SpriteViewProps {
  absolutePath: string;
  asset: AssetRef;
}

const ZOOM_LEVELS = [
  6.25, 12.5, 25, 50, 75, 100, 150, 200, 300, 400, 800, 1600, 3200,
];

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

  const [zoom, setZoom] = useState(100);

  function zoomIn() {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[idx + 1]);
    }
  }

  function zoomOut() {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx > 0) {
      setZoom(ZOOM_LEVELS[idx - 1]);
    }
  }

  function resetZoom() {
    setZoom(100);
  }

  const lastZoomTime = useRef(0);

  return (
    <Center
      w="full"
      h="full"
      bgSize="30px 30px"
      bgPos="0 0, 15px 15px"
      position="relative"
      onWheel={e => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastZoomTime.current < 50) return;
        lastZoomTime.current = now;
        if (e.deltaY > 0) {
          zoomOut();
        } else {
          zoomIn();
        }
      }}
      bgImage="repeating-linear-gradient(45deg, #676767 25%, transparent 25%, transparent 75%, #676767 75%, #676767), repeating-linear-gradient(45deg, #676767 25%, #7e7e7e 25%, #7e7e7e 75%, #676767 75%, #676767)"
    >
      <Image
        transition="transform 0.2s"
        transform={`scale(${zoom / 100})`}
        userSelect="none"
        pointerEvents="none"
        style={{
          imageRendering: 'pixelated',
        }}
        ref={imgRef}
        src={data}
        shadow="lg"
      />
      <Group
        attached
        position="fixed"
        right={4}
        bottom={4}
        divideX="1px"
        colorPalette="yellow"
      >
        <IconButton size="2xs" onClick={zoomOut}>
          <LuMinus />
        </IconButton>
        <Button size="2xs" onClick={resetZoom}>
          {zoom}%
        </Button>
        <IconButton size="2xs" onClick={zoomIn}>
          <LuPlus />
        </IconButton>
      </Group>
    </Center>
  );
}
