import { useApp, useTick } from '@pixi/react';
import {
  Application,
  Container,
  Geometry,
  Mesh,
  RenderTexture,
  Shader,
  Sprite,
} from 'pixi.js';
import { Dispatch, RefObject, useEffect, useRef, useState } from 'react';

// import gi_frag from './gi.glsl';
// import jump_flood from './jump_flood.glsl';
// import sdf from './sdf.glsl';
// import srgb_frag from './srgb_frag.glsl';
import vertex from './vertex.glsl';
import voronoi_seed from './voronoi_seed.glsl';

const width = 960;
const height = 550;

const sceneTexture = RenderTexture.create({ width, height });
const voronoiSeedTexture = RenderTexture.create({ width, height });

type PipelineTextures = {
  sceneTexture: RenderTexture;
  voronoiSeedTexture: RenderTexture;
  finalVoronoiTexture: RenderTexture;
  distanceTexture: RenderTexture;
  giTexture: RenderTexture;
  finalTexture: RenderTexture;
};

const geometry = new Geometry({
  attributes: {
    aPosition: [0, 0, width, 0, width, height, 0, height],
    aUV: [0, 0, 1, 0, 1, 1, 0, 1],
  },
  indexBuffer: [0, 1, 2, 0, 2, 3],
});

function renderPipeline(
  app: Application,
  container: Container,
  setPipelineTextures: Dispatch<PipelineTextures>,
) {
  // Ensure the scene is rendered into sceneTexture before starting the pipeline
  const beforeVisibility = container.visible;
  container.visible = true;
  app.renderer.render({
    container: container,
    target: sceneTexture,
  });
  container.visible = beforeVisibility;

  // 1. Voronoi Seed Pass
  const voronoiSeedShader = Shader.from({
    gl: { vertex, fragment: voronoi_seed },
    resources: {
      u_input_tex: sceneTexture,
    },
  });

  const voronoiSeedMesh = new Mesh({ geometry, shader: voronoiSeedShader });
  const vonoiSeedContainer = new Container({ width, height });
  vonoiSeedContainer.addChild(voronoiSeedMesh);
  app.renderer.render({
    container: vonoiSeedContainer,
    target: voronoiSeedTexture,
  });

  // // 2. Jump Flooding Passes
  // const passes = Math.ceil(Math.log2(Math.max(width, height)));
  // let jfaInput = voronoiSeedTexture;
  // let finalVoronoiTexture: RenderTexture = voronoiSeedTexture;
  // for (let i = 0; i < passes; i++) {
  //   const offset = Math.pow(2, passes - i - 1);
  //   const jfaTexture = RenderTexture.create({ width, height });
  //   const jfaShader = Shader.from({
  //     gl: { vertex, fragment: jump_flood },
  //     resources: {
  //       u_input_tex: jfaInput,
  //       u_offset: offset,
  //       u_resolution: [width, height],
  //     },
  //   });
  //   const jfaMesh = new Mesh({ geometry, shader: jfaShader });
  //   app.renderer.render({ container: jfaMesh, target: jfaTexture });
  //   jfaInput = jfaTexture;
  //   finalVoronoiTexture = jfaTexture;
  // }

  // // 3. Distance Field Pass
  // const distanceTexture = RenderTexture.create({ width, height });
  // const distanceShader = Shader.from({
  //   gl: { vertex, fragment: sdf },
  //   resources: {
  //     u_input_tex: finalVoronoiTexture,
  //     u_resolution: [width, height],
  //     u_dist_mod: 1.0,
  //   },
  // });
  // const distanceMesh = new Mesh({ geometry, shader: distanceShader });
  // app.renderer.render({ container: distanceMesh, target: distanceTexture });

  // // 4. GI Pass
  // const giTexture = RenderTexture.create({ width, height });
  // const giShader = Shader.from({
  //   gl: { vertex, fragment: gi_frag },
  //   resources: {
  //     u_distance_data: distanceTexture,
  //     u_scene_data: sceneTexture,
  //     u_resolution: [width, height],
  //     u_time: 0.0,
  //     u_rays_per_pixel: 32,
  //     u_emission_multi: 1.0,
  //     u_max_raymarch_steps: 128,
  //   },
  // });
  // const giMesh = new Mesh({ geometry, shader: giShader });
  // app.renderer.render({ container: giMesh, target: giTexture });

  // // 5. sRGB Pass
  // const finalTexture = RenderTexture.create({ width, height });
  // const finalShader = Shader.from({
  //   gl: { vertex, fragment: srgb_frag },
  //   resources: {
  //     u_GI_texture: giTexture,
  //   },
  // });
  // const finalMesh = new Mesh({ geometry, shader: finalShader });
  // app.renderer.render({ container: finalMesh, target: finalTexture });

  // Store textures in state so the parent can use them
  setPipelineTextures({
    sceneTexture,
    voronoiSeedTexture,
    // finalVoronoiTexture,
    finalVoronoiTexture: null!,
    // distanceTexture,
    distanceTexture: null!,
    // giTexture,
    giTexture: null!,
    // finalTexture,
    finalTexture: null!,
  });
}

export function useGiPipeline(
  containerRef: RefObject<Container>,
  sceneTexture: RenderTexture,
) {
  const app = useApp();
  const [pipelineTextures, setPipelineTextures] =
    useState<null | PipelineTextures>(null!);

  useEffect(() => {
    if (!app || !containerRef.current) return;
    renderPipeline(app, containerRef.current, setPipelineTextures);
  }, [app, containerRef, sceneTexture]);

  useTick(() => {
    if (!app || !containerRef.current) return;
    renderPipeline(app, containerRef.current, setPipelineTextures);
  });

  return pipelineTextures;
}

export function Lighting({ playerData, lights, occluders }: any) {
  const containerRef = useRef<Container>(null);
  const lightRef = useRef<Sprite>(null);
  const pipelineTextures = useGiPipeline(containerRef, sceneTexture);

  return (
    <container>
      <container visible={false} ref={containerRef} width={960} height={550}>
        <sprite
          ref={lightRef}
          texture={lights}
          width={48}
          height={48}
          x={playerData.current.x}
          y={playerData.current.y}
        />
        <sprite texture={occluders} x={0} y={0} />
      </container>
      {pipelineTextures && (
        <>
          <sprite texture={pipelineTextures.sceneTexture} x={0} y={550} />
          <sprite texture={pipelineTextures.voronoiSeedTexture} x={0} y={550} />
        </>
      )}
    </container>
  );
}
