import SceneObject from '../core/sceneObject';
import {Scene} from 'three';

export default class Curtains extends SceneObject {

    constructor(scene: Scene) {
        super(scene);
    }

    protected getFbxFile(): string {
        return 'room.fbx_curtain';
    }

    protected getTextureFile(): string {
        return '';
    }
}