precision mediump float;
uniform sampler2D u_input_tex;
varying vec2 vTextureCoord;
void main() {
  vec4 scene_col = texture2D(u_input_tex, vTextureCoord);
  float a = scene_col.a;
  gl_FragColor = vec4(vTextureCoord.x * a, vTextureCoord.y * a, 0.0, 1.0);
}
