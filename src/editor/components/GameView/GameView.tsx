import { Application, useAsset, useExtend, useTick } from '@pixi/react';
import { InputProvider, useActionState } from '@s92/celeris-input/react-pixi';
import { Container, Sprite, Spritesheet, Text, Texture } from 'pixi.js';
import { Suspense, useRef } from 'react';

import { PlayerActions, PlayerBindings } from '~/game/inputs';

interface GameViewProps {}

type Direction = 's' | 'n' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

function getDirection(dx: number, dy: number, last: Direction): Direction {
  if (dx === 0 && dy === 0) return last;
  if (dx === 0) {
    return dy > 0 ? 's' : 'n';
  }
  if (dy === 0) {
    return dx > 0 ? 'e' : 'w';
  }
  if (dx > 0 && dy > 0) return 'se';
  if (dx > 0 && dy < 0) return 'ne';
  if (dx < 0 && dy > 0) return 'sw';
  return 'nw';
}

function Player() {
  const texture = useAsset<Texture>({
    src: '/sprites/Minnie24px_VS8.png',
  });
  const spritesheetData = useAsset<Spritesheet>({
    src: '/sprites/Minnie_v2_[VS8].spritesheet.json',
  });
  const spriteRef = useRef<Sprite>(null);
  const timeRef = useRef<number>(0);
  const directionRef = useRef<Direction>('s');
  const up = useActionState(PlayerActions.Up);
  const down = useActionState(PlayerActions.Down);
  const left = useActionState(PlayerActions.Left);
  const right = useActionState(PlayerActions.Right);

  useTick(() => {
    timeRef.current += 16;

    const ld = left.get().isDown ? -1 : 0;
    const rd = right.get().isDown ? 1 : 0;
    const dx = ld + rd;

    const ud = up.get().isDown ? -1 : 0;
    const dd = down.get().isDown ? 1 : 0;
    const dy = ud + dd;

    directionRef.current = getDirection(dx, dy, directionRef.current);

    let animation = spritesheetData.animations[`walk_${directionRef.current}`];

    if (dx === 0 && dy === 0) {
      animation = spritesheetData.animations[`idle_${directionRef.current}`];
    }

    const speed = 1;

    if (spriteRef.current) {
      spriteRef.current.x += dx * speed;
      spriteRef.current.y += dy * speed;
      spriteRef.current.texture =
        animation[Math.floor(timeRef.current / 100) % animation.length];
    }
  });

  return <sprite ref={spriteRef} texture={texture} x={132} y={210} />;
}

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

  return (
    <Application width={960} height={550} background={0x00ffff}>
      <InputProvider actions={PlayerActions} bindings={PlayerBindings}>
        <Suspense fallback={<sprite texture={pg || texture || fg || pg} />}>
          <sprite texture={pg} x={0} y={0} />
          <sprite texture={fg} x={0} y={0} />
          <Player />
          {/* <sprite texture={cc} x={0} y={0} /> */}
        </Suspense>
      </InputProvider>
    </Application>
  );
}
