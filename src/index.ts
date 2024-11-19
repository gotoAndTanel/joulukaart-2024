import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module';
import { getRoom } from './modelHelpers';
import { getLights, getSkyBox } from './lightsHelper';
import { GUI } from 'dat.gui';
import { addDatGuiForObject } from './tools';
import {Vector3} from 'three';

const w = window.innerWidth;
const h = window.innerHeight;
const cameraInverseSize: number = 200;
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
const camera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, 1, 5000 );
const controls = new OrbitControls (camera, renderer.domElement);
controls.target = new Vector3(0, 3, 0);
camera.position.set(-10, 10, 5);
camera.lookAt(0, 3, 0);

// CANVAS
container.appendChild(renderer.domElement);
window.addEventListener("resize", windowResized, false);

// SKYBOX AND LIGHTING
const cameraLightsSizeFactor = 1
const lights = getLights();
scene.add(lights);
const skyBox = getSkyBox();
scene.add(skyBox);

// MODELS
let room = getRoom();
scene.add(room);
addDatGuiForObject(gui, room, "Room");

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