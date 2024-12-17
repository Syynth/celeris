precision mediump float;

uniform sampler2D u_input_tex;
uniform float u_offset;
uniform vec2 u_resolution; // provided in JS code

varying vec2 vUvs;

void main(void)
{
    float closest_dist = 9999999.9;
    vec2 closest_pos = vec2(0.0);

    // Compute pixel size from resolution
    vec2 pixelSize = 1.0 / u_resolution;

    for (float x = -1.0; x <= 1.0; x += 1.0) {
        for (float y = -1.0; y <= 1.0; y += 1.0) {
            // Offset by pixel units scaled by u_offset
            vec2 voffset = vUvs + vec2(x, y) * pixelSize * u_offset;

            // Optional: boundary checks
            if (voffset.x < 0.0 || voffset.x > 1.0 || voffset.y < 0.0 || voffset.y > 1.0) {
                continue;
            }

            vec2 pos = texture2D(u_input_tex, voffset).xy;
            float dist = distance(pos, vUvs);

            // If pos is non-zero and is closer, store it
            if (pos.x != 0.0 && pos.y != 0.0 && dist < closest_dist) {
                closest_dist = dist;
                closest_pos = pos;
            }
        }
    }

    gl_FragColor = vec4(closest_pos, 0.0, 1.0);
}
