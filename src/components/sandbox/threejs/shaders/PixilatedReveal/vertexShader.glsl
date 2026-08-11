 uniform vec2 uVelocity;
  uniform float uWarpStrength;
  uniform float uWarpEnabled;
  uniform float uWarpMode;
  varying vec2 vUv;

  void main() {
      vUv = uv;
      vec3 pos = position;
      if (uWarpEnabled > 0.5) {
          float velLen = length(uVelocity);
          if (uWarpMode < 0.5) {
              if (velLen > 0.001) {
                  vec2 velDir = uVelocity / velLen;
                  float along = dot((uv - 0.5) * 2.0, velDir);
                  float trailW = 1.0 - (along * 0.5 + 0.5);
                  trailW = trailW * trailW;
                  pos.xy += uVelocity * trailW * uWarpStrength;
              }
          } else if (uWarpMode > 2.5) {
              if (velLen > 0.001) {
                  vec2 velDir = uVelocity / velLen;
                  float along = dot((uv - 0.5) * 2.0, velDir);
                  float trailW = along * 0.5 + 0.5;
                  trailW = trailW * trailW;
                  pos.xy += uVelocity * trailW * uWarpStrength;
              }
          } else if (velLen > 0.001) {
              vec2 fromCenter = (uv - 0.5) * 2.0;
              float dist = length(fromCenter);
              if (dist > 0.001) {
                  float edge = dist * dist;
                  float signVal = uWarpMode > 1.5 ? -1.0 : 1.0;
                  pos.xy += normalize(fromCenter) * velLen * uWarpStrength * signVal * edge;
              }
          }
      }
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }