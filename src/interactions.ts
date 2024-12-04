import * as THREE from 'three';
import gsap from 'gsap';

export default class Interactions {


    static interactions: { [name: string] : (object: THREE.Object3D) => void } = {
        'col-chair': (object: THREE.Object3D) => {
            gsap.to(object.rotation, { duration: 1, y: object.rotation.y + Math.PI })
        },
        'col-dog': (object: THREE.Object3D) => {
            const timeline = gsap.timeline();
            const jumpDuration = 1;
            const jumpHeight = .5;

            if (!gsap.isTweening(object.position)) {
                timeline
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y + jumpHeight, ease: 'back.out', }, 'start')
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y, ease: 'bounce.out' })
            }
        }
    }
}