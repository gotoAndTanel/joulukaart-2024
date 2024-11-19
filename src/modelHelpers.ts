import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'

// https://assetstore.unity.com/packages/3d/environments/landscapes/low-poly-simple-nature-pack-162153
const natureModelsTexture = './models/NaturePackLite_Texture.png';

enum NatureModel {
    TREE3 = 'Tree_03',
    ROCK1 = 'Rock_01',
    ROCK4 = 'Rock_04'
}

export function getRoom() {

    const group = new THREE.Group();

    // LOAD MODELS ASYNCRONOUSLY AND ADD TO GROUP ONCE LOADED
    loadModel('room').then((model) => {
        model.position.set(0, 0, 0);
        group.add(model);
    });
    
    return group;
}

async function loadNatureModel(model: NatureModel) {
    const fileName = `./models/${model}.fbx`;
    const res = (await new FBXLoader().loadAsync(fileName)); 
    const texture = await (new THREE.TextureLoader().loadAsync(natureModelsTexture))
    applyGroupTexture(res, texture);
    return res;
}

async function loadModel(model: string) {
    const fileName = `./models/${model}.fbx`;
    const res = (await new FBXLoader().loadAsync(fileName));
    const texture = await (new THREE.TextureLoader().loadAsync(natureModelsTexture))
    applyGroupTexture(res, texture);
    return res;
}

function applyGroupTexture(model: THREE.Group, texture: THREE.Texture) {
    model.traverse(function (mesh) {
        if (mesh instanceof THREE.Mesh) {
            applyMeshTexture(mesh, texture);
        }
    });            
}


function applyMeshTexture(mesh: THREE.Mesh, texture: THREE.Texture) {
    mesh.traverse(function (mesh) {
        if (mesh instanceof THREE.Mesh) {
            if (!mesh.material.map) {
                mesh.material.map = texture;
            }
            mesh.material.alpha = 1;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.material.needsUpdate = true;
        }
    });            
}
