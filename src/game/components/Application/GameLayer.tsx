import { chakra } from '@chakra-ui/react';
import { Application } from 'pixi.js';
import { useEffect, useRef } from 'react';

import {
  GameSessionEvent,
  GameSessionState,
} from '~/game/machines/GameSession';

async function initGameView(canvas: HTMLCanvasElement): Promise<Application> {
  const app = new Application();
  await app.init({
    canvas,
    width: 640,
    height: 360,
  });

  app.render();
  return app;
}

interface GameLayerProps {
  send: (event: GameSessionEvent) => void;
  state: GameSessionState;
}

export function GameLayer({}: GameLayerProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (canvas) {
      void initGameView(canvas);
    }
  }, []);

  return <chakra.canvas zIndex={0} w="full" h="full" ref={ref} />;
}
