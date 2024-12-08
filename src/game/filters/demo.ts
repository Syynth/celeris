import { Application, Assets, Filter, GlProgram, Sprite } from 'pixi.js';

import fragment from './custom.frag';
import vertex from './custom.vert';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    resizeTo: window,
    hello: true,
    preference: 'webgl',
  });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the texture
  const texture = await Assets.load('https://pixijs.com/assets/bg_grass.jpg');

  // Create background image
  const background = Sprite.from(texture);

  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);

  // Create the filter
  const filter = new Filter({
    glProgram: new GlProgram({
      vertex,
      fragment,
    }),
    resources: {
      filterUniforms: {
        // We'll assume these match your desired values
        uResolution: {
          value: [app.screen.width, app.screen.height],
          type: 'vec2<f32>',
        },
        highestColor: { value: [1.0, 1.0, 1.0], type: 'vec3<f32>' },
        similarThreshold: { value: 0.0, type: 'f32' },
        lineWidth: { value: 1.0, type: 'f32' },
      },
    },
  });

  background.filters = [filter];

  // If you want to interactively change uniforms:
  // filter.resources.filterUniforms.similarThreshold = 0.05;
  // filter.resources.filterUniforms.lineWidth = 1.2;

  // Update resolution uniforms on resize (optional)
  window.addEventListener('resize', () => {
    filter.resources.filterUniforms.uResolution = [
      app.screen.width,
      app.screen.height,
    ];
  });

  // Just animate something if desired
  app.ticker.add(() => {
    // For demonstration, maybe change lineWidth over time:
    filter.resources.filterUniforms.lineWidth =
      1.0 + 0.5 * Math.sin(app.ticker.lastTime / 500);
  });
})();
