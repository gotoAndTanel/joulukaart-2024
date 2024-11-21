import SceneObject from '../core/sceneObject';
import {Scene} from 'three';

export default class StaticObjects extends SceneObject {

    constructor(scene: Scene) {
        super(scene);
    }

    protected getFbxFile(): string {
        return 'room.fbx_static';
    }

    protected getTextureFile(): string {
        return '';
    }
}