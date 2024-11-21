import SceneObject from '../core/sceneObject';
import {Scene} from 'three';

export default class Letter extends SceneObject {

    constructor(scene: Scene) {
        super(scene);
    }

    protected getFbxFile(): string {
        return 'room.fbx_letter';
    }

    protected getTextureFile(): string {
        return 'letter_texture';
    }
}