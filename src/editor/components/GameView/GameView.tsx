import { Application, useAsset, useExtend, useTick } from '@pixi/react';
import { InputProvider, useActionState } from '@s92/celeris-input/react-pixi';
import { Container, Sprite, Spritesheet, Text, Texture } from 'pixi.js';
import { Suspense, useRef } from 'react';
import { PlayerActions, PlayerBindings } from '~/game/inputs';

interface GameViewProps {}

type Direction = 'left' | 'right' | 'up' | 'down';

function getDirection(dx: number, dy: number, last: Direction): Direction {
  if (dx === 0 && dy === 0) return last;
  if (dx < 0) return 'left';
  if (dx > 0) return 'right';
  if (dy < 0) return 'up';
  return 'down';
}

function Player() {
  const texture = useAsset<Texture>({
    src: '/sprites/Minnie_v2_[VS8].png',
  });
  const spritesheetData = useAsset<Spritesheet>({
    src: '/sprites/Minnie_v2_[VS8].spritesheet.json',
  });
  const spriteRef = useRef<Sprite>(null);
  const timeRef = useRef<number>(0);
  const directionRef = useRef<'left' | 'right' | 'up' | 'down'>('down');
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

    const speed = 3;

    if (spriteRef.current) {
      spriteRef.current.x += dx * speed;
      spriteRef.current.y += dy * speed;
      spriteRef.current.texture =
        animation[Math.floor(timeRef.current / 100) % animation.length];
    }
  });

  return <sprite ref={spriteRef} texture={texture} x={100} y={0} />;
}

export function GameView({}: GameViewProps) {
  useExtend({ Container, Sprite, Text, Spritesheet });

  const texture = useAsset<Texture>({
    src: '/sprites/Minnie_v2_[VS8].png',
  });

  return (
    <Application width={1920} height={1080} background={0x00ffff}>
      <InputProvider actions={PlayerActions} bindings={PlayerBindings}>
        <Suspense fallback={<sprite texture={texture} />}>
          <Player />
        </Suspense>
      </InputProvider>
    </Application>
  );
}
