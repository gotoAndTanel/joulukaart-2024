import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module';
import { getLights, getSkyBox } from './lightsHelper';
import { GUI } from 'dat.gui';
import {Vector3} from 'three';
import Letter from './objects/letter';
import StaticObjects from './objects/staticObjects';
import Curtains from './objects/curtains';
import Structure from './objects/structure';

const w = window.innerWidth;
const h = window.innerHeight;
const container = document.getElementById("canvas");
const aspectRatio = w / h;  const fieldOfView = 75;
const groundSize = new THREE.Vector2(20,20);

// DEV
const gui = new GUI();
const stats = Stats(); document.body.appendChild(stats.dom);
const grid = new THREE.GridHelper(groundSize.x, groundSize.y, new THREE.Color(0xff0000), new THREE.Color(0x4C704C));

// SCENE  
const scene = new THREE.Scene();

// RENDERER
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(w, h);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

// CAMERA
const cameraSize = .015;
const verticalOffset = 5;
const camera = new THREE.OrthographicCamera( -w * cameraSize / 2, w * cameraSize / 2, h * cameraSize / 2 , -h * cameraSize / 2, 1, 5000 );
const controls = new OrbitControls (camera, renderer.domElement);
controls.target = new Vector3(0, verticalOffset, 0);
camera.position.set(-10, 10 + verticalOffset, 10);
camera.lookAt(0, verticalOffset, 0);

// CANVAS
container.appendChild(renderer.domElement);
window.addEventListener("resize", windowResized, false);

// SKYBOX AND LIGHTING
const lights = getLights();
scene.add(lights);
const skyBox = getSkyBox();
scene.add(skyBox);

// MODELS
new Structure(scene);
new Letter(scene);
new StaticObjects(scene);
new Curtains(scene);

function windowResized() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  let deltaTime = clock.getDelta();

  // ...

  renderer.render(scene, camera);  
  stats.update()
}

animate();

// DEV CHECKBOXES
document.getElementById("toggleGrid").addEventListener( 'change', function () {
  (<HTMLInputElement>this).checked ? scene.add(grid) : scene.remove(grid);
});

document.getElementById("toggleStats").addEventListener( 'change', function () {
  stats.dom.style.visibility = (<HTMLInputElement>this).checked ? "visible" : "hidden";
});