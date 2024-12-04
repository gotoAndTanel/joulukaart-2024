import * as THREE from 'three';
import gsap from 'gsap';

export default class Interactions {

    private static isWindowOpen: boolean = false

    private static interactions: { [name: string] : (object: THREE.Object3D) => void } = {
        'col-chair': (object: THREE.Object3D) => {
            gsap.to(object.rotation, { duration: 1, y: object.rotation.y + Math.PI })
        },
        'col-dog': (object: THREE.Object3D) => {
            const timeline = gsap.timeline();
            const jumpDuration = 1;
            const jumpHeight = .5;

            if (!gsap.isTweening(object.position)) {
                timeline
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y + jumpHeight, ease: 'back.out', }, 0)
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y, ease: 'bounce.out' })
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
                } else {
                    timeline
                        .to(object.rotation, { duration, y: object.rotation.y - rotationAmount, ease: 'back.inOut' })
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