import {Object3D, Scene} from 'three';
import {loadModel} from '../modelHelpers';

export default abstract class SceneObject {

    object: Object3D
    constructor(scene: Scene) {
        loadModel(this.getFbxFile(), this.getTextureFile()).then((object: Object3D) => {
            this.object = object;
            scene.add(this.object);
        })
    }

    protected getFbxFile(): string {
        return '';
    };

    protected getTextureFile(): string {
        return '';
    };
}