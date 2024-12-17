import * as THREE from 'three';
import {Audio, AudioListener, AudioLoader, Material, OrthographicCamera} from 'three';
import gsap from 'gsap';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls';
import Snow from './snow';
import AudioPlayer from './audioPlayer';
import Timeline = gsap.core.Timeline;

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
    public static catAudio: THREE.Audio
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
    public static catVolume = {
        value: 0
    }

    public static sounds: { [key: string]: AudioPlayer } = {}
    public static musicNotes: { [key: string]: MusicMouth } = {}

    private static isWindowOpen: boolean = false
    private static catTimeline: Timeline
    private static boxOpened: boolean = false
    private static isScreenYule: boolean = false
    public static isLetterDismissed: boolean = false
    private static buffers: { [key: string]: AudioBuffer } = {}

    public static loadBuffers = () => {
        Object.keys(Interactions.noteMap).forEach((key) => {
            Interactions.audioLoader.load(`sounds/presents/${Interactions.noteMap[key]}.wav`, (buffer: AudioBuffer) => {
                Interactions.buffers[key] = buffer;
            });
        })
    }

    private static getMusicMouth = (object: THREE.Object3D, sound: string, loadedCallback: (mouth: MusicMouth) => void): void => {
        if (!Interactions.musicNotes[sound]) {
            const audio = new THREE.Audio(Interactions.listener)
            audio.setBuffer(Interactions.buffers[sound])

            const face = object.children.find((child) => child.name.indexOf('face') !== -1);
            const mouth = face.children.find((child) => child.name.indexOf('mouth') !== -1);

            const timeline = Interactions.createMusicMouthTimeline(mouth, audio)

            Interactions.musicNotes[sound] = {
                face,
                timeline,
                audio,
                isActive: false
            };

            audio.onEnded = () => {
                if (Interactions.musicNotes[sound].isActive) {
                    audio.stop();
                    audio.play();
                    timeline.restart();
                }
            }
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
        'col-egg': (object: THREE.Object3D) => {
            const timeline = gsap.timeline();
            const jumpDuration = 1;
            const jumpHeight = .05;

            if (!gsap.isTweening(object.position)) {
                timeline
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y + jumpHeight, ease: 'back.out', }, 0)
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y, ease: 'bounce.out' })
            }
        },
        'col-cat': (object: THREE.Object3D) => {
            if (!Interactions.catTimeline) {
                Interactions.catTimeline = new Timeline()
                Interactions.catTimeline.repeat(-1)
                Interactions.catTimeline
                    .to(object.rotation, { duration: 6, 'y': object.rotation.y + Math.PI * 2, ease: 'none' })
                Interactions.catTimeline.pause()
            }

            const tree = object.parent
            const shakeTimeline = new Timeline()

            Interactions.sounds['tree'].play()
            shakeTimeline
                .to(tree.rotation, { x: .02, duration: .1 })
                .to(tree.rotation, { y: .016, duration: .085 })
                .to(tree.rotation, { x: -.021, duration: .09 }, .1 )
                .to(tree.rotation, { y: -.012, duration: .11 }, .08 )
                .to(tree.rotation, { x: 0, duration: .1 } )
                .to(tree.rotation, { y: 0, duration: .1 } )

            const timeline = Interactions.catTimeline;

            if (gsap.isTweening(Interactions.catVolume)) {
                gsap.killTweensOf(Interactions.catVolume);
            }

            if (timeline.isActive()) {
                gsap.to(Interactions.catVolume, { duration: 2, value: 0,
                    onUpdate: () => {
                        Interactions.catAudio.setVolume(Interactions.catVolume.value);
                        timeline.timeScale(Interactions.catVolume.value);
                    },
                    onComplete: () =>  {
                        timeline.pause()
                    }
                })
            } else {
                gsap.to(Interactions.catVolume, { duration: 2, value: 1,  onUpdate: () => {Interactions.catAudio.setVolume(Interactions.catVolume.value); timeline.timeScale(Interactions.catVolume.value)} })
                timeline.play()
            }
        },
        'col-fish': (object: THREE.Object3D) => {
            const timeline = gsap.timeline();
            const jumpDuration = 1;
            const jumpHeight = .05;

            if (!gsap.isTweening(object.position)) {
                timeline
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y + jumpHeight, ease: 'back.out', }, 0)
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y, ease: 'bounce.out' })
            }
        },
        'col-books': (object: THREE.Object3D) => {
            const timeline = gsap.timeline();
            const jumpDuration = 1;
            const jumpHeight = .05;

            if (!gsap.isTweening(object.position)) {
                timeline
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y + jumpHeight, ease: 'back.out', }, 0)
                    .to(object.position, { duration: jumpDuration / 2, y: object.position.y, ease: 'bounce.out' })
            }
        },
        'col-giftbox': (object: THREE.Object3D) => {
            const timeline = gsap.timeline();
            const duration = 1.2;
            const zoomAmount = 2.4;

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