import { useApp, useTick } from '@pixi/react';
import { Container, RenderTexture, Shader, Sprite } from 'pixi.js';
import { useRef } from 'react';

import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

const sceneTexture = RenderTexture.create({
  width: 960,
  height: 550,
});

Shader.from({
  gl: {
    vertex,
    fragment,
  },
  resources: {
    u_input_tex: sceneTexture,
  },
});

export function Lighting({ playerData, occluders }: any) {
  const app = useApp();
  const containerRef = useRef<Container>(null);
  const lightRef = useRef<Sprite>(null);

  useTick(() => {
    if (!lightRef.current) return;
    if (!containerRef.current) return;
    lightRef.current.x = playerData.current.x;
    lightRef.current.y = playerData.current.y;
    lightRef.current.texture = playerData.current.texture;
    app.renderer.render({
      target: sceneTexture,
      container: containerRef.current,
    });
  });

  return (
    <container>
      <container visible={false} ref={containerRef}>
        <sprite
          ref={lightRef}
          texture={playerData.current.texture}
          x={playerData.current.x}
          y={playerData.current.y}
        />
        <sprite texture={occluders} x={0} y={0} />
      </container>
      <sprite texture={sceneTexture} x={0} y={550} />
    </container>
  );
}
