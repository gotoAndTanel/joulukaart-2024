import SceneObject from '../core/sceneObject';
import {Scene} from 'three';

export default class Structure extends SceneObject {

    constructor(scene: Scene) {
        super(scene);
    }

    protected getFbxFile(): string {
        return 'room.fbx_structure';
    }

    protected getTextureFile(): string {
        return '';
    }
}