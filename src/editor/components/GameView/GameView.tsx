import { Application, useAsset, useExtend } from '@pixi/react';
import { InputProvider } from '@s92/celeris-input/react-pixi';
import { Container, Sprite, Spritesheet, Text, Texture } from 'pixi.js';
import { Suspense, useRef } from 'react';

import { PlayerActions, PlayerBindings } from '~/game/inputs';

import { Lighting } from './Lighting';
import { Player } from './Player';

interface GameViewProps {}

export function GameView({}: GameViewProps) {
  useExtend({ Container, Sprite, Text, Spritesheet });

  const texture = useAsset<Texture>({
    src: '/sprites/Minnie24px_VS8.png',
  });
  const fg = useAsset<Texture>({
    src: '/sprites/SSFG.png',
  });
  const pg = useAsset<Texture>({
    src: '/sprites/SSPG.png',
  });
  const cc = useAsset<Texture>({
    src: '/sprites/SSC.png',
  });

  const currentPlayer = useRef<any>({ x: 0, y: 0, texture });

  const onMove = (x: number, y: number, texture: Texture) => {
    currentPlayer.current = { x, y, texture };
  };

  return (
    <Application width={960} height={1100} background={0x00ffff}>
      <InputProvider actions={PlayerActions} bindings={PlayerBindings}>
        <Suspense fallback={<sprite texture={pg || texture || fg || pg} />}>
          <sprite texture={pg} x={0} y={0} />
          <sprite texture={fg} x={0} y={0} />
          <Player onMove={onMove} />
          <Lighting playerData={currentPlayer} occluders={cc} />
        </Suspense>
      </InputProvider>
    </Application>
  );
}
