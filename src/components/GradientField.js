import * as THREE from 'three';

// Screen-space colormap background, always behind the solid particles.
const field = `
  uniform vec2 uPointer,uResolution;
  uniform float uStrength,uIridescence,uMouseStrength,uTravel,uGrain;
  float flowField(vec2 uv){
    vec2 p=(uv-.5)*vec2(uResolution.x/uResolution.y,1.0);
    vec2 mouse=uPointer*uMouseStrength;
    p-=mouse*vec2(.15,.12);
    p.y+=uTravel*.004;
    vec2 bend=vec2(sin(p.y*2.3+p.x*.7),cos(p.x*1.8-p.y*1.2));
    p+=bend*.24+mouse*.055*sin(p.y*2.0);
    float a=sin(p.x*2.05+p.y*1.0+sin(p.y*1.7)*.85);
    float b=cos(p.y*3.0-p.x*.65+sin(p.x*1.1)*.6);
    return clamp(.5+(a+b*.65)*.285,0.,1.);
  }
`;
export function createGradientField() {
  const material = new THREE.ShaderMaterial({
    uniforms: { uPointer:{value:new THREE.Vector2()},uResolution:{value:new THREE.Vector2(1280,720)},
      uStrength:{value:.8},uIridescence:{value:.16},uMouseStrength:{value:1},uTravel:{value:0},uGrain:{value:.012} },
    depthWrite:false,depthTest:false,transparent:false,
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,1.0,1.0);}`,
    fragmentShader: field+`
      varying vec2 vUv;
      vec3 colormap(float t){
        vec3 black=vec3(.002,.0025,.0032),graphite=vec3(.009,.011,.014);
        vec3 silver=vec3(.045,.049,.054),petrol=vec3(.012,.020,.025);
        vec3 c=mix(black,graphite,smoothstep(.08,.35,t));
        c=mix(c,silver,smoothstep(.28,.57,t));
        c=mix(c,petrol,smoothstep(.57,.78,t));
        return mix(c,black,smoothstep(.78,1.,t));
      }
      void main(){
        float shape=flowField(vUv);
        vec3 color=colormap(shape)*uStrength;
        vec3 film=.5+.5*cos(shape*7.+vUv.y*1.8+vec3(0.,2.1,4.2));
        color+=(film-.45)*uIridescence*.018*smoothstep(.25,.65,shape);
        float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
        color+=grain*uGrain*.05;
        color*=1.-.22*smoothstep(.4,1.,length((vUv-.5)*1.3));
        gl_FragColor=vec4(max(color,vec3(.001)),1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);
  mesh.frustumCulled=false;mesh.renderOrder=-100;return mesh;
}
