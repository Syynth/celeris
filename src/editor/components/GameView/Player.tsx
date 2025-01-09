import { useAsset, useTick } from '@pixi/react';
import { useActionState } from '@s92/celeris-input/react-pixi';
import { Sprite, Spritesheet, Texture } from 'pixi.js';
import { useRef } from 'react';

import { PlayerActions } from '~/game/inputs';

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

export function Player({
  onMove,
}: {
  onMove?: (x: number, y: number, tex: Texture) => void;
}) {
  const texture = useAsset<Texture>({ src: '/sprites/Minnie24px_VS8.png' });
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
    if (!texture || !spritesheetData) return;

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

      onMove?.(
        spriteRef.current.x,
        spriteRef.current.y,
        spriteRef.current.texture,
      );
    }
  });

  return (
    <sprite visible={true} ref={spriteRef} texture={texture} x={132} y={210} />
  );
}
