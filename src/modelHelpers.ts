import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'

enum NatureModel {
    TREE3 = 'Tree_03',
    ROCK1 = 'Rock_01',
    ROCK4 = 'Rock_04'
}

export function getRoom() {

    const group = new THREE.Group();

    // LOAD MODELS ASYNCRONOUSLY AND ADD TO GROUP ONCE LOADED
    loadModel('room.fbx_structure', '').then((model) => {
        model.position.set(0, 0, 0);
        group.add(model);
    });
    
    return group;
}

async function loadModel(model: string, textureFile: string = '') {
    const fileName = `./models/${model}.fbx`;
    const textureName = `./textures/${textureFile !== '' ? textureFile : 'fallback_texture'}.png`;
    const res = (await new FBXLoader().loadAsync(fileName));
    const texture = await (new THREE.TextureLoader().loadAsync(textureName))
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
            mesh.material.map = texture;
            mesh.material.side = THREE.DoubleSide
            mesh.material.alpha = 1;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.material.needsUpdate = true;
        }
    });            
}

export {loadModel}