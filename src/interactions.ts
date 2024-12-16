import * as THREE from 'three';
import gsap from 'gsap';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls';
import {Audio, AudioListener, AudioLoader, Material, OrthographicCamera} from 'three';
import Snow from './snow';
import AudioPlayer from './audioPlayer';
import Timeline = gsap.core.Timeline;
import {time} from 'three/src/nodes/utils/Timer';

interface MusicMouth {
    face: THREE.Object3D,
    timeline: Timeline,
    audio: Audio,
    isActive: boolean
}

export default class Interactions {

    public static cameraZoomControls: TrackballControls
    public static camera: OrthographicCamera
    public static windowSnow: Snow
    public static defaultScreenMaterial: Material
    public static yuleMaterial: Material
    public static fireplaceAudio: THREE.Audio
    public static ambientAudio: THREE.Audio
    public static audioLoader: AudioLoader
    public static listener: AudioListener

    public static zoomModifier: number = 1

    private static noteMap = {
        'angry': 'notes-001',
        'sad': 'notes-002',
        'red': 'notes-003',
        'sleep': 'notes-004',
        'yellow': 'notes-005',
        'blue': 'notes-006',
    }

    public static ambientVolume: number = 0

    public static sounds: { [key: string]: AudioPlayer } = {}
    public static musicNotes: { [key: string]: MusicMouth } = {}

    private static isWindowOpen: boolean = false
    private static boxOpened: boolean = false
    private static isScreenYule: boolean = false
    public static isLetterDismissed: boolean = false

    private static getMusicMouth = (object: THREE.Object3D, sound: string, loadedCallback: (mouth: MusicMouth) => void): void => {
        if (!Interactions.musicNotes[sound]) {
            const audio = new THREE.Audio(Interactions.listener)
            const face = object.children.find((child) => child.name.indexOf('face') !== -1);
            const mouth = face.children.find((child) => child.name.indexOf('mouth') !== -1);

            const timeline = Interactions.createMusicMouthTimeline(mouth, audio)

            const musicMouth = {
                face,
                timeline,
                audio,
                isActive: false
            }

            Interactions.musicNotes[sound] = musicMouth;
            audio.onEnded = () => {
                if (Interactions.musicNotes[sound].isActive) {
                    audio.stop();
                    audio.play();
                    timeline.restart();
                }
            }

            Interactions.audioLoader.load(`sounds/presents/${Interactions.noteMap[sound]}.wav`, (buffer: AudioBuffer) => {
                audio.setBuffer(buffer);
                if (loadedCallback) {
                    loadedCallback(musicMouth)
                }
            });

            return;
        }

        loadedCallback(Interactions.musicNotes[sound]);
    }

    private static toggleMouth = (mouth: MusicMouth): void => {
        if (!gsap.isTweening(mouth.face.scale)) {
            mouth.isActive = !mouth.isActive

            if (mouth.isActive) {
                gsap.to(mouth.face.scale, { duration: 1, x: 1, y: 1, z: 1, ease: 'elastic.out' })
                mouth.timeline.restart()
                mouth.audio.stop()
                mouth.audio.play()
            } else {
                gsap.to(mouth.face.scale, { duration: .1, x: 0, y: 0, z: 0 })
            }
        }
    }

    private static createMusicMouthTimeline = (mouth: THREE.Object3D, audio: THREE.Audio): Timeline => {
        const timeline = new Timeline();
        const mouthOpeningDuration = 1.5;
        const mouthClosingDuration = 4;

        timeline
            .to(mouth.scale, { duration: 0, 'x': .3, 'y': .3, 'z': .3 }, 0)
            .to(mouth.scale, { duration: mouthOpeningDuration, 'x': 1, 'y': 1, 'z': 1 , ease: 'elastic.out' }, 0)
            .to(mouth.scale, { duration: mouthClosingDuration, 'x': .4, 'y': .4, 'z': .4 })

        return timeline;
    }

    private static interactions: { [name: string] : (object: THREE.Object3D) => void } = {
        'col-present-angry': (object: THREE.Object3D) => {
            Interactions.getMusicMouth(object, 'angry', (mouth) => {
                Interactions.toggleMouth(mouth);
            });
        },
        'col-present-blue': (object: THREE.Object3D) => {
            Interactions.getMusicMouth(object, 'blue', (mouth) => {
                Interactions.toggleMouth(mouth);
            });
        },
        'col-present-red': (object: THREE.Object3D) => {
            Interactions.getMusicMouth(object, 'red', (mouth) => {
                Interactions.toggleMouth(mouth);
            });
        },
        'col-present-sad': (object: THREE.Object3D) => {
            Interactions.getMusicMouth(object, 'sad', (mouth) => {
                Interactions.toggleMouth(mouth);
            });
        },
        'col-present-sleep': (object: THREE.Object3D) => {
            Interactions.getMusicMouth(object, 'sleep', (mouth) => {
                Interactions.toggleMouth(mouth);
            });
        },
        'col-present-yellow': (object: THREE.Object3D) => {
            Interactions.getMusicMouth(object, 'yellow', (mouth) => {
                Interactions.toggleMouth(mouth);
            });
        },
        'col-chair': (object: THREE.Object3D) => {
            gsap.to(object.rotation, { duration: 1, y: object.rotation.y + Math.PI })
            Interactions.sounds['chair'].play()
        },
        'col-screen': (object: THREE.Object3D) => {
            Interactions.isScreenYule = !Interactions.isScreenYule;
            object.material = Interactions.isScreenYule ? Interactions.yuleMaterial : Interactions.defaultScreenMaterial;
            Interactions.sounds['mouse'].play()
            if (Interactions.isScreenYule) {
                Interactions.fireplaceAudio.play()
            } else {
                Interactions.fireplaceAudio.pause()
            }
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
            const zoomAmount = 2.8;

            if (!Interactions.boxOpened && Interactions.isLetterDismissed) {
                Interactions.boxOpened = true;
                Interactions.sounds['box'].play()
                timeline
                    .to(object.position, { duration, y: object.position.y + 12, ease: 'power1.inOut' }, 0)
                    .to(object.material, { duration: duration / 2, opacity: 0 }, duration / 2)
                    .to(Interactions.cameraZoomControls, { duration: duration / 2, minZoom: zoomAmount * Interactions.zoomModifier }, duration / 2)
                    .to(Interactions.camera, { duration, zoom: zoomAmount * Interactions.zoomModifier, onUpdate: () => Interactions.camera.updateProjectionMatrix() }, duration / 3 * 2);
            }
        },
        'col-window': (object: THREE.Object3D) => {
            const timeline = gsap.timeline();
            const duration = 1.2
            const rotationAmount = Math.PI * .2
            const handle = object.getObjectByName('r-handle')

            if (!gsap.isTweening(object.rotation) && !gsap.isTweening(handle.rotation)) {
                Interactions.isWindowOpen = !Interactions.isWindowOpen

                if (Interactions.isWindowOpen) {
                    Interactions.sounds['windowOpen'].play()
                    gsap.to(Interactions, { duration: duration * .3, delay: duration * .7, ambientVolume: .3,  onUpdate: () => {Interactions.ambientAudio.setVolume(Interactions.ambientVolume)} })
                    timeline
                        .to(handle.rotation, {duration: duration * .33, z: handle.rotation.z + Math.PI * .5})
                        .to(object.rotation, { duration, y: object.rotation.y + rotationAmount, ease: 'back.inOut' })
                        .to(Interactions.windowSnow.particles.material, { duration: duration * .5, opacity: .5 }, duration * .7)
                } else {
                    Interactions.sounds['windowClose'].play()
                    gsap.to(Interactions, { duration: duration * .3, delay: duration * .5, ambientVolume: 0,  onUpdate: () => {Interactions.ambientAudio.setVolume(Interactions.ambientVolume)} })
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