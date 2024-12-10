import {Audio, AudioListener, AudioLoader} from 'three';

export default class AudioPlayer {

    buffers: AudioBuffer[];
    listener: AudioListener;
    private volume: number = 1;
    private players: Audio[] = [];
    detuneAmount: number = 0.05

    constructor(buffers: AudioBuffer[], listener: AudioListener) {
        this.buffers = buffers
        this.listener = listener
    }

    public setVolume = (volume: number) => {
        this.volume = volume
    }

    public play = () => {
        let player = this.findAvailablePlayer()

        if (player == undefined) {
            player = new Audio(this.listener)
            this.players.push(player)
        }

        player.setBuffer(this.buffers[Math.floor(this.buffers.length * Math.random())]);
        player.setVolume(this.volume);
        player.setDetune(1 + (this.detuneAmount * 2) * Math.random() - this.detuneAmount);
        player.play();
    }

    private findAvailablePlayer = (): Audio | undefined => {
        return this.players.find((audioPlayer) => !audioPlayer.isPlaying)
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