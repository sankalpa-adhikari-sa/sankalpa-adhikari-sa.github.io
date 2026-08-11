uniform float u_progress;
uniform float u_gridScale;
uniform sampler2D u_image;

varying vec2 vUv;

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec2 st = vUv * u_gridScale;
    vec2 ipos = floor(st); 

    // Assign a random threshold (0.0 to 1.0) to this specific block
    float blockThreshold = random(ipos);

    // If u_progress is greater than the block's random threshold, mask becomes 1.0
    float mask = step(blockThreshold, u_progress);

    vec4 texColor = texture2D(u_image, vUv);

    gl_FragColor = vec4(texColor.rgb, texColor.a * mask);
}