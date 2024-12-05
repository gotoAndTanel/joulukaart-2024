import * as THREE from 'three'
import {CameraHelper, Vector3} from 'three';

const sun_color = new THREE.Color( '#ffffff' )
const counter_light = new THREE.Color( 0x8a8aff )
const sky_color = new THREE.Color( '#ffffff' )
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
export function getLights() {

  const group = new THREE.Group();

  // AMBIENT LIGHT
  const hemiLight = new THREE.HemisphereLight( sky_color, ground_color, .4 );
  hemiLight.position.set( 0, 50, 0 );
  group.add( hemiLight );

  var lightDirection = new THREE.Vector3( 1, .5, .4 )
  // RIGHT LIGHT
  const rightLight = new THREE.DirectionalLight( sun_color, .1 );
  rightLight.castShadow = true;
  rightLight.shadow.mapSize.width = 1024 * 2;
  rightLight.shadow.mapSize.height = 1024 * 2;
  rightLight.shadow.camera = new THREE.OrthographicCamera( -10, 8, -5, 11, 1, 30 );
  rightLight.shadow.bias -= 0.0001 * 100

  rightLight.position.set(lightDirection.x, lightDirection.y, lightDirection.z);
  rightLight.position.multiplyScalar( 18 );

  group.add(rightLight);
  group.add(rightLight.target)
  rightLight.target.position.z -= 3.5

  // group.add(new CameraHelper(rightLight.shadow.camera))

  // LEFT LIGHT
  const leftLight = new THREE.DirectionalLight( counter_light, .1 );
  leftLight.position.set(-1, .1, .5);
  leftLight.position.multiplyScalar( 10 );
  leftLight.castShadow = false;
  leftLight.shadow.camera = new THREE.OrthographicCamera( -10, 10, -9, 10, 1, 20 );
  group.add( leftLight );
  // group.add(new CameraHelper(leftLight.shadow.camera))

  const pointLight = new THREE.PointLight(0xdbfff8, .6, 20, 4)
  pointLight.position.set(0, 8, 0)
  pointLight.castShadow = true;
  pointLight.shadow.bias -= 0.0001 * 100
  group.add(pointLight)
            
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