import {Audio, AudioListener, AudioLoader} from 'three';

export default class AudioPlayer {

    buffers: AudioBuffer[];
    listener: AudioListener;
    private volume: number = 1;
    private players: Audio[] = [];
    detuneAmount: number = 100

    constructor(buffers: AudioBuffer[], listener: AudioListener) {
        this.buffers = buffers
        this.listener = listener
    }

    public setVolume = (volume: number) => {
        this.volume = volume
    }

    public play = (delay: number = 0) => {
        this.playSpecific(Math.floor(this.buffers.length * Math.random()), delay)
    }

    public playSpecific = (idx: number, delay: number = 0) => {
        const player = this.findAvailablePlayer()

        player.setBuffer(this.buffers[idx]);
        player.setVolume(this.volume);
        player.setDetune(1 + (this.detuneAmount * 2) * Math.random() - this.detuneAmount);
        player.play(delay);
    }

    private findAvailablePlayer = (): Audio | undefined => {
        let player = this.players.find((audioPlayer) => !audioPlayer.isPlaying)

        if (player == undefined) {
            player = new Audio(this.listener)
            this.players.push(player)
        }

        return player;
    }

    static loadAudio(loader: AudioLoader, baseName: string, numberOfVariants: number = 1) {
        const audioBuffers: AudioBuffer[] = []

        if (numberOfVariants == 1) {
            loader.load(baseName, (buffer) => {
                audioBuffers.push(buffer)
            })
        } else {
            const parts = baseName.split('.');

            for (let i = 1; i <= numberOfVariants; i++) {
                const url = parts[0] + '-' + i.toString().padStart(3, '0') + '.' + parts[1];
                loader.load(url, (buffer) => {
                    audioBuffers.push(buffer)
                })
            }
        }

        return audioBuffers
    }
}