import * as THREE from 'three';
import {BufferAttribute, BufferGeometry, Texture} from 'three';

export default class Snow {

    public particles: THREE.Points

    public wobbleStrength: number = .1
    public fallSpeed: number = 1
    public fadeDistance: number = 1
    public isEmitting: boolean = true

    private pointRandomValues: number[]
    private pointVisible: boolean[]
    private timePassed: number = 0
    private pointsStart: Float32Array

    rangeX: { min: number, max: number }
    rangeY: { min: number, max: number }
    rangeZ: { min: number, max: number }

    constructor(numberOfParticles: number, halfSize: THREE.Vector3, texture: Texture) {
        const pointsGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        this.rangeX = { min: -halfSize.x, max: halfSize.x }
        this.rangeY = { min: -halfSize.y, max: halfSize.y }
        this.rangeZ = { min: -halfSize.z, max: halfSize.z }
        const points: number[] = []
        const colors: number[] = []
        this.pointRandomValues = []
        this.pointVisible = []

        for (let i = 0; i < numberOfParticles; i++) {
            const x = Math.random() * (this.rangeX.max - this.rangeX.min) + this.rangeX.min;
            const y = Math.random() * (this.rangeY.max - this.rangeY.min) + this.rangeY.min;
            const z = Math.random() * (this.rangeZ.max - this.rangeZ.min) + this.rangeZ.min;
            points.push(x, y, z)
            colors.push(1, 1, 1)
            if (i % 3 == 0) {
                this.pointRandomValues.push(Math.random())
                this.pointVisible.push(false)
            }
        }
        pointsGeometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3))
        this.pointsStart = new Float32Array(points)
        pointsGeometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))

        const pointsMaterial = new THREE.PointsMaterial({ alphaMap: texture, transparent: true })
        pointsMaterial.size = 10
        pointsMaterial.sizeAttenuation = true
        pointsMaterial.opacity = .5
        pointsMaterial.transparent = true
        pointsMaterial.vertexColors = true

        this.particles = new THREE.Points(pointsGeometry, pointsMaterial)
    }

    public updateSnowPosition = (deltaTime: number): void => {
        this.timePassed += deltaTime

        const position = this.particles.geometry.attributes.position
        const colors = this.particles.geometry.attributes.color
        const fadeDistance = this.fadeDistance

        for (let i = 0; i < position.array.length / 3; i++) {
            const x = i * 3;
            const y = i * 3 + 1;
            const z = i * 3 + 2;
            const randomValue = this.pointRandomValues[i];
            const pointVisible = this.pointVisible[i];

            //const velX = Math.sin(deltaTime * 0.001 * velocity.x) * 0.1;
            //const velZ = Math.cos(deltaTime * 0.0015 * velocity.z) * 0.1;

            const xPos = position.array[x]
            const yPos = position.array[y]
            const zPos = position.array[z]

            if (position.array[y] <= this.rangeY.min) {
                if (this.isEmitting) {
                    position.array[y] = this.rangeY.max;
                    this.pointVisible[i] = true;
                }
            } else {
                const fadeAmount = (pointVisible ? Math.min(1, Math.max(0, Math.min(
                    Math.min(Math.abs(xPos - this.rangeX.max), Math.abs(xPos - this.rangeX.min)),
                    Math.min(Math.abs(yPos - this.rangeY.max), Math.abs(yPos - this.rangeY.min)),
                    Math.min(Math.abs(zPos - this.rangeZ.max), Math.abs(zPos - this.rangeZ.min)),
                ) / fadeDistance)) : 0);

                colors.array[x] = fadeAmount
                colors.array[y] = fadeAmount
                colors.array[z] = fadeAmount

                position.array[x] = this.pointsStart[x] + Math.sin(this.timePassed * (1 + randomValue)) * (1 + randomValue) * this.wobbleStrength;
                position.array[y] -= .5 * (randomValue + 1) * deltaTime * this.fallSpeed;
                position.array[z] = this.pointsStart[z] + Math.cos( 1.2 * this.timePassed * (1 + randomValue)) * (1 + randomValue) * this.wobbleStrength;
            }
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.color.needsUpdate = true;
    }

}