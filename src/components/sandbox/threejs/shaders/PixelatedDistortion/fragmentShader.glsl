uniform sampler2D uTexture; 
uniform sampler2D uDataTexture; 
uniform vec4 resolution;
varying vec2 vUv; 

void main() { 
    float quadAspect = resolution.x / resolution.y;
    float imageAspect = resolution.z / resolution.w;

    vec2 ratio = (quadAspect < imageAspect) 
        ? vec2(quadAspect / imageAspect, 1.0) 
        : vec2(1.0, imageAspect / quadAspect);

    vec2 coverUV = (vUv - 0.5) * ratio + 0.5;

    vec4 offset = texture2D(uDataTexture, vUv); 
    
    gl_FragColor = texture2D(uTexture, coverUV - 0.02 * offset.rg); 
}