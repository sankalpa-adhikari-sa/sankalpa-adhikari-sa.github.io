#ifdef GL_ES
precision mediump float;
#endif

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;

#define DITHERING
#define BACKGROUND
#define pi 3.14159265
#define R(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

// Procedural hash fallback to avoid needing custom iChannel textures
float hash3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yxz + 19.19);
    return fract((p.x + p.y) * p.z);
}

// Fixed noise function without broken textureLod/iChannel references
float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    
    float n = p.x + p.y*57.0 + 113.0*p.z;
    return mix(
        mix(mix(hash3(p + vec3(0,0,0)), hash3(p + vec3(1,0,0)), f.x),
            mix(hash3(p + vec3(0,1,0)), hash3(p + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash3(p + vec3(0,0,1)), hash3(p + vec3(1,0,1)), f.x),
            mix(hash3(p + vec3(0,1,1)), hash3(p + vec3(1,1,1)), f.x), f.y), f.z);
}

float fbm(vec3 p)
{
   return noise(p*.06125)*.5 + noise(p*.125)*.25 + noise(p*.25)*.125 + noise(p*.4)*.2;
}

float length2( vec2 p )
{
    return sqrt( p.x*p.x + p.y*p.y );
}

float length8( vec2 p )
{
    p = p*p; p = p*p; p = p*p;
    return pow( p.x + p.y, 1.0/8.0 );
}

float Disk( vec3 p, vec3 t )
{
    vec2 q = vec2(length2(p.xy)-t.x,p.z*0.5);
    return max(length8(q)-t.y, abs(p.z) - t.z);
}

const float nudge = 0.9;
float normalizer = 1.0 / sqrt(1.0 + nudge*nudge);
float SpiralNoiseC(vec3 p)
{
    float n = 0.0;
    float iter = 2.0;
    for (int i = 0; i < 8; i++)
    {
        n += -abs(sin(p.y*iter) + cos(p.x*iter)) / iter;
        p.xy += vec2(p.y, -p.x) * nudge;
        p.xy *= normalizer;
        p.xz += vec2(p.z, -p.x) * nudge;
        p.xz *= normalizer;
        iter *= 1.733733;
    }
    return n;
}

float NebulaNoise(vec3 p)
{
    float final = Disk(p.xzy,vec3(2.0,1.8,1.25));
    final += fbm(p*90.);
    final += SpiralNoiseC(p.zxy*0.5123+100.0)*3.0;

    return final;
}

float map(vec3 p) 
{
    R(p.xz, iMouse.x*0.008*pi+iTime*0.1);

    float NebNoise = abs(NebulaNoise(p/0.5)*0.5);
    
    return NebNoise+0.07;
}

vec3 computeColor( float density, float radius )
{
    vec3 result = mix( vec3(1.0,0.9,0.8), vec3(0.4,0.15,0.1), density );
    vec3 colCenter = 7.*vec3(0.8,1.0,1.0);
    vec3 colEdge = 1.5*vec3(0.48,0.53,0.5);
    result *= mix( colCenter, colEdge, min( (radius+.05)/.9, 1.15 ) );
    return result;
}

bool RaySphereIntersect(vec3 org, vec3 dir, out float near, out float far)
{
    float b = dot(dir, org);
    float c = dot(org, org) - 8.;
    float delta = b*b - c;
    if( delta < 0.0) 
        return false;
    float deltasqrt = sqrt(delta);
    near = -b - deltasqrt;
    far = -b + deltasqrt;
    return far > 0.0;
}

vec3 ToneMapFilmicALU(vec3 _color)
{
    _color = max(vec3(0), _color - vec3(0.004));
    _color = (_color * (6.2*_color + vec3(0.5))) / (_color * (6.2 * _color + vec3(1.7)) + vec3(0.06));
    return _color;
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    
    // Default key zoom input if no texture is provided
    float key = 0.0;

    vec3 rd = normalize(vec3((fragCoord.xy-0.5*iResolution.xy)/iResolution.y, 1.));
    vec3 ro = vec3(0., 0., -6.+key*1.6);
    
    float ld=0., td=0., w=0.;
    float d=1., t=0.;
    const float h = 0.1;
    vec4 sum = vec4(0.0);
    float min_dist=0.0, max_dist=0.0;

    if(RaySphereIntersect(ro, rd, min_dist, max_dist))
    {
        t = min_dist*step(t,min_dist);
       
        for (int i=0; i<64; i++) 
        {
            vec3 pos = ro + t*rd;
            if(td>0.9 || d<0.1*t || t>10. || sum.a > 0.99 || t>max_dist) break;
            
            float d = map(pos);
            d = max(d,0.0);
            
            vec3 ldst = vec3(0.0)-pos;
            float lDist = max(length(ldst), 0.001);

            vec3 lightColor=vec3(1.0,0.5,0.25);
            
            sum.rgb+=(vec3(0.67,0.75,1.00)/(lDist*lDist*10.)/80.);
            sum.rgb+=(lightColor/exp(lDist*lDist*lDist*.08)/30.);
            
            if (d<h) 
            {
                ld = h - d;
                w = (1. - td) * ld;
                td += w + 1./200.;
                vec4 col = vec4( computeColor(td,lDist), td );
                sum += sum.a * vec4(sum.rgb, 0.0) * 0.2;    
                col.a *= 0.2;
                col.rgb *= col.a;
                sum = sum + col*(1.0 - sum.a);  
            }
          
            td += 1./70.;

            #ifdef DITHERING
            vec2 uv = fragCoord.xy / iResolution.xy;
            uv.y*=120.;
            uv.x*=280.;
            // Dithering using noise fallback
            d=abs(d)*(.8+0.08*noise(vec3(uv.y, -uv.x+0.5*sin(4.*iTime+uv.y*4.0), 0.0)));
            #endif 
            
            t += max(d * 0.1 * max(min(length(ldst),length(ro)),1.0), 0.01);
        }
        
        sum *= 1. / exp( ld * 0.2 ) * 0.6;
        sum = clamp( sum, 0.0, 1.0 );
        sum.xyz = sum.xyz*sum.xyz*(3.0-2.0*sum.xyz);
    }

    #ifdef BACKGROUND
    if (td<.8)
    {
        vec3 stars = vec3(noise(rd*500.0)*0.5+0.5);
        vec3 starbg = vec3(0.0);
        starbg = mix(starbg, vec3(0.8,0.9,1.0), smoothstep(0.99, 1.0, stars)*clamp(dot(vec3(0.0),rd)+0.75,0.0,1.0));
        starbg = clamp(starbg, 0.0, 1.0);
        sum.xyz += starbg; 
    }
    #endif

    gl_FragColor = vec4(sum.xyz, 1.0);
}