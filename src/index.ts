import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module';
import { getLights, getSkyBox } from './lightsHelper';
import { GUI } from 'dat.gui';
import {Vector3} from 'three';
import { DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

const w = window.innerWidth;
const h = window.innerHeight;
const container = document.getElementById("canvas");
const groundSize = new THREE.Vector2(20,20);

/**
 * DEV
 */

const gui = new GUI();
const stats = Stats(); document.body.appendChild(stats.dom);
const grid = new THREE.GridHelper(groundSize.x, groundSize.y, new THREE.Color(0xff0000), new THREE.Color(0x4C704C));

/**
 * SCENE
 */

const scene = new THREE.Scene();

/**
 * RENDERER
 */

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(w, h);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

/**
 * CANVAS
 */

container.appendChild(renderer.domElement);
window.addEventListener("resize", windowResized, false);

/**
 * CAMERA
 */

const cameraSize = .015;
const verticalOffset = 1.5;
const camera = new THREE.OrthographicCamera( -w * cameraSize / 2, w * cameraSize / 2, h * cameraSize / 2 , -h * cameraSize / 2, 1, 5000 );
camera.position.set(10, 10 + verticalOffset, 10);

/**
 * CAMERA CONTROLS
 */

const controls = new OrbitControls (camera, renderer.domElement);
controls.target = new Vector3(0, verticalOffset, 0);
controls.enableDamping = true;
controls.minZoom = 2;
controls.maxZoom = 10;
controls.minAzimuthAngle = 0
controls.maxAzimuthAngle = Math.PI * .5
controls.minPolarAngle = 0
controls.maxPolarAngle = Math.PI * .5

camera.lookAt(controls.target);
camera.zoom = controls.minZoom;
camera.updateProjectionMatrix();

/**
 * SKYBOX
 */

const lights = getLights();
scene.add(lights);
const skyBox = getSkyBox();
scene.add(skyBox);

/**
 * LOADERS
 */

const textureLoader = new THREE.TextureLoader()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * TEXTURES
 */

const roomTexture = textureLoader.load('textures/light/light_walls.jpg')
roomTexture.flipY = false
roomTexture.encoding = THREE.sRGBEncoding

const carpetTexture = textureLoader.load('textures/light/lights_carpet.jpg')
carpetTexture.flipY = false
carpetTexture.encoding = THREE.sRGBEncoding

const treeTexture = textureLoader.load('textures/baked/baked_tree.jpg')
treeTexture.flipY = false
treeTexture.encoding = THREE.sRGBEncoding

const mountedTexture = textureLoader.load('textures/baked/baked_mounted.jpg')
mountedTexture.flipY = false
mountedTexture.encoding = THREE.sRGBEncoding


const tableTexture = textureLoader.load('textures/baked/baked_table.jpg')
tableTexture.flipY = false
tableTexture.encoding = THREE.sRGBEncoding

/**
 * MATERIALS
 */

const roomMaterial = new THREE.MeshBasicMaterial({ map: roomTexture })
const carpetMaterial = new THREE.MeshBasicMaterial({ map: carpetTexture })
const treeMaterial = new THREE.MeshBasicMaterial({ map: treeTexture })
const mountedMaterial = new THREE.MeshBasicMaterial({ map: mountedTexture })
const tableMaterial = new THREE.MeshBasicMaterial({ map: tableTexture })

/**
 * MODELS
 */

gltfLoader.load(
    'models/office.glb',
    (gltf) => {
        scene.add(gltf.scene)
        gltf.scene.traverse((object) => {
            if (object.name.indexOf('r-') == 0) {
                object.material = roomMaterial
            } else if (object.name.indexOf('c-') == 0) {
                object.material = carpetMaterial
            } else {
                if (object.name.indexOf('tree-') == 0) {
                    object.material = treeMaterial
                } else if (object.name.indexOf('mounted-') == 0) {
                    object.material = mountedMaterial
                } else if (object.name.indexOf('table-') == 0) {
                    object.material = tableMaterial
                }
            }
        })
    }
)

/**
 * WINDOW RESIZE
 */
function windowResized() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  renderer.setSize(w, h);
  camera.left = - w * cameraSize / 2;
  camera.right = w * cameraSize / 2;
  camera.top = h * cameraSize / 2;
  camera.bottom = - h * cameraSize / 2;
  camera.updateProjectionMatrix();
}

/**
 * ANIMATE
 */

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  let deltaTime = clock.getDelta();

  controls.update();
  renderer.render(scene, camera);  
  stats.update();
}

animate();

/**
 * DEV TOGGLES
 */

document.getElementById("toggleGrid").addEventListener( 'change', function () {
  (<HTMLInputElement>this).checked ? scene.add(grid) : scene.remove(grid);
});

document.getElementById("toggleStats").addEventListener( 'change', function () {
  stats.dom.style.visibility = (<HTMLInputElement>this).checked ? "visible" : "hidden";
});