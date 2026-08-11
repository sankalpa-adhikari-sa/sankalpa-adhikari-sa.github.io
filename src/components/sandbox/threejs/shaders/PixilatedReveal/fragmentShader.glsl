 uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uProgress;
  uniform float uGridSize;
  uniform vec3 uPixelColor;
  uniform float uAlpha;
  uniform float uTransitioning;
  uniform float uDirection;
  uniform float uWaveNoise;
  uniform float uBandWidth;
  uniform float uEntry;
  uniform float uExit;
  uniform float uColorRandom;
  uniform float uRandomRange;
  uniform float uDistortion;
  uniform float uDistGridSize;
  uniform float uDistEnabled;
  varying vec2 vUv;

  float rand(vec2 n) {
      return fract(sin(dot(n, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
      vec2 distUv = vUv;
      if (uDistEnabled > 0.5) {
          float gs = max(uDistGridSize, 1.0);
          vec2 cell = floor(vUv * gs) / gs;
          float nx = rand(cell) * 2.0 - 1.0;
          float ny = rand(cell + vec2(3.7, 9.2)) * 2.0 - 1.0;
          distUv = clamp(vUv + vec2(nx, ny) * (uDistortion / gs), 0.0, 1.0);
      }

      if (uTransitioning < 0.5) {
          gl_FragColor = vec4(texture2D(uTexA, distUv).rgb, uAlpha);
      } else {
          vec2 waveCell = floor(vUv * uGridSize);
          float cellNoise = (rand(waveCell) - 0.5) * 2.0;
          float crossNoise = (rand(waveCell + vec2(17.3, 5.7)) - 0.5) * 2.0;
          float noise = (cellNoise + crossNoise * 0.4) * uWaveNoise;

          float dirY = uDirection > 0.0 ? (waveCell.y / uGridSize) : (1.0 - (waveCell.y / uGridSize));
          float threshold = dirY + noise;
          float band = uBandWidth / uGridSize;

          if (threshold > uProgress + band) {
              if (uEntry > 0.5) discard;
              gl_FragColor = vec4(texture2D(uTexA, distUv).rgb, uAlpha);
          } else if (threshold > uProgress - band) {
              float bv = uColorRandom > 0.5 ? rand(waveCell) * uRandomRange + (1.0 - uRandomRange) : 1.0;
              gl_FragColor = vec4(uPixelColor * bv, uAlpha);
          } else {
              if (uExit > 0.5) discard;
              gl_FragColor = vec4(texture2D(uTexB, distUv).rgb, uAlpha);
          }
      }
  }