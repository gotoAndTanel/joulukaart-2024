import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { getLights, getSkyBox } from './lightsHelper';
import {SRGBColorSpace, Vector2, Vector3} from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {CSS3DObject, CSS3DRenderer} from 'three/examples/jsm/renderers/CSS3DRenderer';
import interactions from './interactions';
import Snow from './snow';
import GUI from 'lil-gui';
import AudioPlayer from './audioPlayer';

import yuleFragmentShader from './shaders/yule/fragment.glsl';
import yuleVertexShader from './shaders/yule/vertex.glsl';

const w = window.innerWidth;
const h = window.innerHeight;
const container = document.getElementById('canvas');

/**
 * DEV
 */

const gui = new GUI({
    width: 400,
    title: 'Office',
    closeFolders: true
})

window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
        gui.show(gui._hidden)
    }
})

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
renderer.outputColorSpace = SRGBColorSpace;
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

const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new Vector3(0, verticalOffset, 0);
controls.enableDamping = true;
controls.minZoom = 1.8;
controls.enableZoom = false;
controls.minAzimuthAngle = 0
controls.maxAzimuthAngle = Math.PI * .5
controls.minPolarAngle = 0
controls.maxPolarAngle = Math.PI * .5

camera.lookAt(controls.target);
camera.zoom = controls.minZoom;
camera.updateProjectionMatrix();

const controlsZoom = new TrackballControls(camera, renderer.domElement);
controlsZoom.noPan = true;
controlsZoom.noRotate = true;
controlsZoom.zoomSpeed = .5;
controlsZoom.minZoom = controls.minZoom;
controlsZoom.maxZoom = 10;

interactions.cameraZoomControls = controlsZoom;
interactions.camera = camera;

/**
 * SKYBOX
 */
const skyBox = getSkyBox();
scene.add(skyBox);

/**
 * LIGHTS
 */

const lights = getLights();
scene.add(lights);

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

const roomTexture = textureLoader.load('textures/baked/baked_room.jpg')
roomTexture.flipY = false
roomTexture.colorSpace = SRGBColorSpace

const carpetTexture = textureLoader.load('textures/baked/baked_carpet.jpg')
carpetTexture.flipY = false
carpetTexture.colorSpace = SRGBColorSpace

const treeTexture = textureLoader.load('textures/baked/baked_tree.jpg')
treeTexture.flipY = false
treeTexture.colorSpace = SRGBColorSpace

const mountedTexture = textureLoader.load('textures/baked/baked_mounted.jpg')
mountedTexture.flipY = false
mountedTexture.colorSpace = SRGBColorSpace

const tableTexture = textureLoader.load('textures/baked/baked_table.jpg')
tableTexture.flipY = false
tableTexture.colorSpace = SRGBColorSpace

const macScreenTexture = textureLoader.load('textures/mac_screen.png')
macScreenTexture.flipY = false
macScreenTexture.colorSpace = SRGBColorSpace

const defaultScreenTexture = textureLoader.load('textures/big_screen.png')
defaultScreenTexture.flipY = false
defaultScreenTexture.colorSpace = SRGBColorSpace

const yuleTexture = textureLoader.load('textures/yule.jpg')
yuleTexture.flipY = false
yuleTexture.colorSpace = SRGBColorSpace

const boxTexture = textureLoader.load('textures/baked/baked_box.jpg')
boxTexture.flipY = false
boxTexture.colorSpace = SRGBColorSpace

const snowTexture = textureLoader.load('textures/snow.png')
snowTexture.flipY = false
snowTexture.colorSpace = SRGBColorSpace

/**
 * MATERIALS
 */

const debugMaterial = new THREE.MeshBasicMaterial({ color: '#ff0000' })
const colMaterial = new THREE.MeshStandardMaterial({ visible: false })

const roomMaterial = new THREE.MeshBasicMaterial({ map: roomTexture })
const carpetMaterial = new THREE.MeshBasicMaterial({ map: carpetTexture })
const treeMaterial = new THREE.MeshBasicMaterial({ map: treeTexture })
const mountedMaterial = new THREE.MeshBasicMaterial({ map: mountedTexture })
const tableMaterial = new THREE.MeshBasicMaterial({ map: tableTexture })
const macScreenMaterial = new THREE.MeshBasicMaterial({ map: macScreenTexture })
const defaultScreenMaterial = new THREE.MeshBasicMaterial({ map: defaultScreenTexture })
interactions.defaultScreenMaterial = defaultScreenMaterial

const currentFrame = { value: 0 };
const yuleMaterial = new THREE.RawShaderMaterial({
    vertexShader: yuleVertexShader,
    fragmentShader: yuleFragmentShader,
    uniforms: {
        'u_texture': { value: yuleTexture },
        'u_grid_size': { value: new Vector2(2, 4) },
        'u_current_frame': currentFrame,
        'u_interpolate': { value: false },
    }
})
interactions.yuleMaterial = yuleMaterial

const boxMaterial = new THREE.MeshBasicMaterial({ map: boxTexture, opacity: 1, transparent: true })

/**
 * MODELS
 */

const applyMaterials = (object) => {
    const names = [object.name, object.parent.name]

    const checkName = (names: string[], value) => {
        return names.some((name) => name.indexOf(value) == 0)
    }

    if (checkName(names, 'col-')) {
        object.material = colMaterial
    } else if (checkName(names, 'r-')) {
        object.material = roomMaterial
    } else if (checkName(names, 'c-')) {
        object.material = carpetMaterial
    } else {
        if (checkName(names, 'tree-')) {
            object.material = treeMaterial
        } else if (checkName(names, 'mac-')) {
            object.material = macScreenMaterial
        } else if (checkName(names, 'screen-')) {
            object.material = defaultScreenMaterial
        } else if (checkName(names, 'mounted-')) {
            object.material = mountedMaterial
        } else if (checkName(names, 'table-')) {
            object.material = tableMaterial
        } else if (checkName(names, 'e-')) {
            // all good
        } else {
            object.material = debugMaterial
        }
    }
}

gltfLoader.load(
    'models/giftbox.glb',
    (gltf) => {
        scene.add(gltf.scene)
        gltf.scene.traverse((object: THREE.Object3D) => {
            object.material = (object.name.indexOf('col-') !== 0 ? boxMaterial : colMaterial)
            if (object.name.indexOf('col') !== -1) {
                interactObjects.push(object)
            }
        })
    }
)

const interactObjects: THREE.Object3D[] = []

gltfLoader.load(
    'models/office.glb',
    (gltf) => {
        scene.add(gltf.scene)
        gltf.scene.traverse((object) => {
            applyMaterials(object)
            if (object.name.indexOf('col') !== -1) {
                interactObjects.push(object)
            }
        })
    }
)

/**
 * LETTER
 */

const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById( 'letter-container' ).appendChild( cssRenderer.domElement );

const letterDomElement = document.getElementById('letter')
const letter = new CSS3DObject(letterDomElement)
const scale = .01
const distanceToCamera = 4
letter.position.add(new Vector3(0, verticalOffset, 0))
letter.position.add(new Vector3().subVectors(camera.position, letter.position).normalize().multiplyScalar(distanceToCamera))
letter.scale.set(scale, scale, scale)
letter.lookAt(camera.position)
scene.add(letter)

letterDomElement.addEventListener('pointerup', (e) => {
    e.preventDefault();
    letterDomElement.classList.add('is-closed');
    interactions.isLetterDismissed = true
})

/**
 * CURSOR
 */

const cursor = new Vector2()

window.addEventListener('mousemove', (_event) => {
    cursor.x = _event.clientX / window.innerWidth * 2 - 1
    cursor.y = _event.clientY / window.innerHeight * -2 + 1

    castRay();
})

/**
 * RAYCASTER
 */

const raycaster = new THREE.Raycaster()

let currentHoverTarget: THREE.Object3D = null

const castRay = () => {
    raycaster.setFromCamera(cursor, camera)

    const intersectedObjects = raycaster.intersectObjects(interactObjects)

    if (intersectedObjects.length > 0) {
        const intersectTarget = intersectedObjects[0].object
        if (intersectTarget !== currentHoverTarget && currentHoverTarget) {
            //currentHoverTarget.material.visible = false;
            currentHoverTarget = null
        }
        currentHoverTarget = intersectTarget
        //currentHoverTarget.material.visible = true;
    } else {
        if (currentHoverTarget) {
            //currentHoverTarget.material.visible = false;
            currentHoverTarget = null
        }
    }
}

/**
 * SNOW
 */

const numberOfParticles = 1000

const snowRightSize = new Vector3(10, 10, 10)
const snowRight = new Snow(numberOfParticles, snowRightSize, snowTexture)
scene.add(snowRight.particles)
snowRight.particles.position.x = 0
snowRight.particles.position.y = 2
snowRight.particles.position.z = -3 - snowRightSize.z

const snowLeftSize = new Vector3(10, 10, 10)
const snowLeft = new Snow(numberOfParticles, snowLeftSize, snowTexture)
scene.add(snowLeft.particles)
snowLeft.particles.position.x = -3 - snowLeftSize.x
snowLeft.particles.position.y = 2
snowLeft.particles.position.z = 0

const snowWindowSize = new Vector3(.5, 1.2, .25)
const snowWindow = new Snow(100, snowWindowSize, snowTexture)
scene.add(snowWindow.particles)
snowWindow.particles.position.x = -1.2
snowWindow.particles.position.y = 1.04
snowWindow.particles.position.z = -1.98
snowWindow.particles.rotation.x = 0.1
snowWindow.particles.rotation.y = 0.7
snowWindow.particles.rotation.z = -0.45
snowWindow.particles.material.opacity = 0
snowWindow.fallSpeed = 3
interactions.windowSnow = snowWindow
snowWindow.fadeDistance = .05

/**
 * AUDIO LISTENER
 */
const listener = new THREE.AudioListener();
camera.add(listener);

/**
 * AMBIENT SOUND
 */
const ambientAudio = new THREE.Audio( listener );
const fireplaceAudio = new THREE.Audio( listener );

/**
 * AUDIO LOADER
 */
const audioLoader = new THREE.AudioLoader();

/**
 * AUDIO
 */
const globalVolume = .2;

audioLoader.load( 'sounds/ambient_wind.wav', function( buffer ) {
    ambientAudio.setBuffer( buffer );
    ambientAudio.setLoop( true );
    ambientAudio.play();
    ambientAudio.setVolume(0);
    interactions.ambientAudio = ambientAudio;
});

audioLoader.load( 'sounds/ambient_fireplace.wav', function( buffer ) {
    fireplaceAudio.setBuffer( buffer );
    fireplaceAudio.setLoop( true );
    fireplaceAudio.setVolume( 3 * globalVolume );
    interactions.fireplaceAudio = fireplaceAudio;
});

const chairAudioBuffers: AudioBuffer[] = AudioPlayer.loadAudio(audioLoader, 'sounds/chair/chair.wav', 4);
const chairAudioPlayer: AudioPlayer = new AudioPlayer(chairAudioBuffers, listener);
chairAudioPlayer.setVolume(globalVolume)
interactions.sounds['chair'] = chairAudioPlayer

const dogAudioBuffers: AudioBuffer[] = AudioPlayer.loadAudio(audioLoader, 'sounds/dog/dog.wav', 3);
const dogAudioPlayer: AudioPlayer = new AudioPlayer(dogAudioBuffers, listener);
dogAudioPlayer.setVolume(globalVolume)
interactions.sounds['dog'] = dogAudioPlayer

const boxAudioBuffers: AudioBuffer[] = AudioPlayer.loadAudio(audioLoader, 'sounds/box/box.wav', 1);
const boxAudioPlayer: AudioPlayer = new AudioPlayer(boxAudioBuffers, listener);
boxAudioPlayer.setVolume(globalVolume * 3)
interactions.sounds['box'] = boxAudioPlayer

const windowOpenAudioBuffers: AudioBuffer[] = AudioPlayer.loadAudio(audioLoader, 'sounds/window/window-002.wav', 1);
const windowOpenAudioPlayer: AudioPlayer = new AudioPlayer(windowOpenAudioBuffers, listener);
windowOpenAudioPlayer.setVolume(globalVolume)
interactions.sounds['windowOpen'] = windowOpenAudioPlayer

const windowCloseAudioBuffers: AudioBuffer[] = AudioPlayer.loadAudio(audioLoader, 'sounds/window/window-001.wav', 1);
const windowCloseAudioPlayer: AudioPlayer = new AudioPlayer(windowCloseAudioBuffers, listener);
windowCloseAudioPlayer.setVolume(globalVolume)
interactions.sounds['windowClose'] = windowCloseAudioPlayer

const mouseAudioBuffers: AudioBuffer[] = AudioPlayer.loadAudio(audioLoader, 'sounds/mouse/mouse.wav', 1);
const mouseAudioPlayer: AudioPlayer = new AudioPlayer(mouseAudioBuffers, listener);
mouseAudioPlayer.setVolume(globalVolume)
interactions.sounds['mouse'] = mouseAudioPlayer

/**
 * INTERACT
 */

let mouseDownStart = Date.now()
let mouseDownPosition: Vector2
const interactionClickMaxLength = 300
const interactionMaxDragDistance = 0.01

container.addEventListener('pointerdown', (e) => {
    mouseDownStart = Date.now()
    mouseDownPosition = new Vector2(e.clientX / window.innerWidth, e.clientY / window.innerHeight)
})

container.addEventListener('pointerup', (e) => {
    const mouseDiff = (new Vector2(e.clientX / window.innerWidth, e.clientY / window.innerHeight)).sub(mouseDownPosition).length()

    if (currentHoverTarget && (Date.now() - mouseDownStart < interactionClickMaxLength) && mouseDiff < interactionMaxDragDistance) {
        interactions.interactWith(currentHoverTarget)
    }
})

/**
 * WINDOW RESIZE
 */
function windowResized() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    cssRenderer.setSize(w, h);
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

    currentFrame.value += deltaTime * 7;
    if (currentFrame.value >= 8) {
        currentFrame.value = currentFrame.value - 8;
    }

    const controlTarget = controls.target
    snowRight.updateSnowPosition(deltaTime);
    snowLeft.updateSnowPosition(deltaTime);
    snowWindow.updateSnowPosition(deltaTime);
    controls.update();
    controlsZoom.target.set(controlTarget.x, controlTarget.y, controlTarget.z)
    controlsZoom.update();
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
}

animate();
