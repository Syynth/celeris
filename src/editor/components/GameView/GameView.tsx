import { chakra } from '@chakra-ui/react';
import { Viewport } from 'pixi-viewport';
import { Application, Assets, Container, Sprite, Texture } from 'pixi.js';
import { useEffect, useRef } from 'react';

interface GameViewProps {}

async function initGameView(canvas: HTMLCanvasElement) {
  const app = new Application();
  await app.init({
    canvas,
    width: 640,
    height: 360,
  });

  const container = new Container();
  const vp = new Viewport({
    worldWidth: 960,
    worldHeight: 540,
    screenWidth: 640,
    screenHeight: 360,
    passiveWheel: true,
    events: app.renderer.events,
  });
  vp.addChild(container);
  app.stage.addChild(vp);

  const playerTex = await Assets.load<Texture>({
    src: '/sprites/Minnie24px_VS8.png',
    loadParser: 'loadTextures',
  });

  const fgTex = await Assets.load<Texture>('/sprites/SSFG.png');
  const pgTex = await Assets.load<Texture>('/sprites/SSPG.png');

  const pg = new Sprite(pgTex);
  pg.x = 0;
  pg.y = 0;
  const fg = new Sprite(fgTex);
  fg.x = 0;
  fg.y = 0;
  const player = new Sprite(playerTex);
  player.x = 320;
  player.y = 180;

  container.addChild(pg);
  container.addChild(fg);
  container.addChild(player);

  app.render();
}

export function GameView({}: GameViewProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (canvas) {
      void initGameView(canvas);
    }
  }, []);

  return <chakra.canvas bg="red.400" width={640} height={360} ref={ref} />;
}
