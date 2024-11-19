import * as THREE from 'three'

const sun_color = new THREE.Color( 0xd7e9ff )
const counter_light = new THREE.Color( 0xd7dfff )
const sky_color = new THREE.Color( 0x334a65 )
const ground_color = new THREE.Color( 0x191623 )

const uniforms = {
  "topColor": { value: sky_color },
  "bottomColor": { value: ground_color },
  "offset": { value: 33 },
  "exponent": { value: 1 }
};

// https://threejs.org/examples/?q=light#webgl_lights_hemisphere
export function getSkyBox() {
    
  const skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
  const skyMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.BackSide
  });
  const sky = new THREE.Mesh( skyGeo, skyMat );
  
  return sky;
}

// https://threejs.org/examples/?q=light#webgl_lights_hemisphere
export function getLights(camera) {

  const group = new THREE.Group();

  // AMBIENT LIGHT
  const hemiLight = new THREE.HemisphereLight( sky_color, ground_color, 0.6 );
  hemiLight.position.set( 0, 50, 0 );
  group.add( hemiLight );

  var lightDirection = new THREE.Vector3( 1, 1, -.2 )
  // RIGHT LIGHT
  const rightLight = new THREE.DirectionalLight( sun_color, 1 );
  rightLight.position.set(lightDirection.x, lightDirection.y, lightDirection.z);
  rightLight.position.multiplyScalar( 10 );
  rightLight.castShadow = true;
  rightLight.shadow.camera = camera;
  group.add( rightLight );

  // LEFT LIGHT
  const leftLight = new THREE.DirectionalLight( counter_light, .05 );
  leftLight.position.set(-lightDirection.x, lightDirection.y, -lightDirection.z);
  leftLight.position.multiplyScalar( 10 );
  leftLight.castShadow = true;
  leftLight.shadow.camera = camera;
  group.add( leftLight );
            
  return group;
}

  // SKYDOME SHADERS
  const vertexShader = `
varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;
  const fragmentShader = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize( vWorldPosition + offset ).y;
    gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
  }  
`;