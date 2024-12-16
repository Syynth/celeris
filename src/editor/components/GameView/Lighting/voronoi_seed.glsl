precision mediump float;

uniform sampler2D u_input_tex;
varying vec2 vUvs;

void main() {
    // Sample the scene texture
    vec4 scene_col = texture2D(u_input_tex, vUvs);

    // If pixel is part of object, scene_col.a > 0.0
    // Store UV * alpha so that only opaque pixels keep their UV, others become black.
    float a = scene_col.a;
    gl_FragColor = vec4(vUvs.x * a, vUvs.y * a, 0.0, 0.5);
    // gl_FragColor = scene_col;
}
