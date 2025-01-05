import { Center, Group, IconButton, Image } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { readFile } from '@tauri-apps/plugin-fs';
import { MouseEvent, WheelEvent, useRef, useState } from 'react';
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

  // track the image's zoom, position, and whether or not we're dragging
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);

  // pos: the current translate offsets for the image
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // store initial mouse-down position for calculations
  const startPos = useRef({ x: 0, y: 0 });

  const { data } = useQuery({
    queryKey: ['spriteView', asset.id],
    queryFn: async () => {
      try {
        const fileData = await readFile(absolutePath);
        const blob = new Blob([fileData], { type: 'image/png' });
        if (imgRef.current) {
          imgRef.current.src = URL.createObjectURL(blob);
        }
        return URL.createObjectURL(blob);
      } catch (err) {
        console.error(err);
      }
    },
  });

  // zoom handlers
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

  // reset zoom also resets the drag position
  function resetZoom() {
    setZoom(100);
    setPos({ x: 0, y: 0 });
  }

  // handle wheel for zoom
  const lastZoomTime = useRef(0);
  function handleWheel(e: WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    const now = Date.now();
    if (now - lastZoomTime.current < 50) return;
    lastZoomTime.current = now;
    if (e.deltaY > 0) {
      zoomOut();
    } else {
      zoomIn();
    }
  }

  // mouse events for dragging
  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return; // only left-click
    setIsDragging(true);
    // record how far into the element we clicked
    startPos.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!isDragging) return;
    e.preventDefault();
    // update offset by the difference from the start position
    setPos({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  // end dragging if the mouse leaves the container
  function handleMouseLeave() {
    if (isDragging) {
      setIsDragging(false);
    }
  }

  return (
    <Center
      w="full"
      h="full"
      position="relative"
      // no scrolling – we do transform-based movement
      userSelect="none"
      overflow="hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      cursor={isDragging ? 'grabbing' : 'grab'}
      bgSize="30px 30px"
      bgPos="0 0, 15px 15px"
      bgImage="repeating-linear-gradient(
        45deg,
        #676767 25%,
        transparent 25%,
        transparent 75%,
        #676767 75%,
        #676767
      ), repeating-linear-gradient(
        45deg,
        #676767 25%,
        #7e7e7e 25%,
        #7e7e7e 75%,
        #676767 75%,
        #676767
      )"
    >
      <Image
        ref={imgRef}
        src={data}
        userSelect="none"
        pointerEvents="none"
        shadow="lg"
        style={{
          // pixelated appearance for retro sprites
          imageRendering: 'pixelated',
          // transform-based pan + zoom
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom / 100})`,
          transition: isDragging ? 'none' : 'transform 0.2s',
        }}
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
