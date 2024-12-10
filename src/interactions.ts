import * as THREE from 'three';
import gsap from 'gsap';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls';
import {OrthographicCamera} from 'three';
import Snow from './snow';
import AudioPlayer from './audioPlayer';

export default class Interactions {

    public static cameraZoomControls: TrackballControls
    public static camera: OrthographicCamera
    public static windowSnow: Snow
    public static sounds: { [key: string]: AudioPlayer } = {}

    private static isWindowOpen: boolean = false
    private static boxOpened: boolean = false
    public static isLetterDismissed: boolean = false

    private static interactions: { [name: string] : (object: THREE.Object3D) => void } = {
        'col-chair': (object: THREE.Object3D) => {
            gsap.to(object.rotation, { duration: 1, y: object.rotation.y + Math.PI })
            Interactions.sounds['chair'].play()
        },
        'col-dog': (object: THREE.Object3D) => {
            const timeline = gsap.timeline();
            const jumpDuration = 1;
            const jumpHeight = .5;

            if (!gsap.isTweening(object.position)) {
                Interactions.sounds['dog'].play()
                timeline
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y + jumpHeight, ease: 'back.out', }, 0)
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y, ease: 'bounce.out' })
            }
        },
        'col-giftbox': (object: THREE.Object3D) => {
            const timeline = gsap.timeline();
            const duration = 1.2;

            if (!Interactions.boxOpened && Interactions.isLetterDismissed) {
                Interactions.boxOpened = true;
                Interactions.sounds['box'].play()
                timeline
                    .to(object.position, { duration, y: object.position.y + 12, ease: 'power1.inOut' }, 0)
                    .to(object.material, { duration: duration / 2, opacity: 0 }, duration / 2)
                    .to(Interactions.cameraZoomControls, { duration: duration / 2, minZoom: 3 }, duration / 2)
                    .to(Interactions.camera, { duration, zoom: 3, onUpdate: () => Interactions.camera.updateProjectionMatrix() }, duration / 3 * 2);
            }
        },
        'col-window': (object: THREE.Object3D) => {
            const timeline = gsap.timeline();
            const duration = 1
            const rotationAmount = Math.PI * .2
            const handle = object.getObjectByName('r-handle')

            if (!gsap.isTweening(object.rotation) && !gsap.isTweening(handle.rotation)) {
                Interactions.isWindowOpen = !Interactions.isWindowOpen

                if (Interactions.isWindowOpen) {
                    timeline
                        .to(handle.rotation, {duration: duration * .33, z: handle.rotation.z + Math.PI * .5})
                        .to(object.rotation, { duration, y: object.rotation.y + rotationAmount, ease: 'back.inOut' })
                        .to(Interactions.windowSnow.particles.material, { duration: duration * .5, opacity: .5 }, duration * .7)
                } else {
                    timeline
                        .to(Interactions.windowSnow.particles.material, { duration: duration * .5, opacity: 0 }, duration * .2)
                        .to(object.rotation, { duration, y: object.rotation.y - rotationAmount, ease: 'back.inOut' }, 0)
                        .to(handle.rotation, {duration: duration * .33, z: handle.rotation.z - Math.PI * .5})
                }
            }
        }
    }

    private static fallbackInteraction: (object: THREE.Object3D) => void = (object: THREE.Object3D) => {

    }

    static interactWith: (object: THREE.Object3D) => void = (object: THREE.Object3D) => {
        if (Interactions.interactions[object.name]) {
            Interactions.interactions[object.name](object.parent)
        } else {
            console.log(`Object named "${object.name}" missing interaction!`);
            Interactions.fallbackInteraction(object.parent)
        }
    }
}