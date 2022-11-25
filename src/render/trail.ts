import * as THREE from "three";

const POINTS_PER_QUAD = 6;

function setPoint(array: Float32Array, i: number, point: THREE.Vector3) {
  array[i] = point.x;
  array[i + 1] = point.y;
  array[i + 2] = point.z;
}

export class Trail {

  target: THREE.Object3D;
  maxQuads: number;
  width: number;
  quadIndex: number = 0;
  samples: THREE.Vector3[] = [];
  mesh: THREE.Mesh;
  offset: THREE.Vector3;

  constructor (scene: THREE.Scene, target: THREE.Object3D, offset: THREE.Vector3) {
    this.maxQuads = 250;
    this.width = 0.1;

    this.target = target;
    this.offset = offset;

    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(this.maxQuads * POINTS_PER_QUAD * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    material.transparent = true;
    material.opacity = 0.1;
    material.depthWrite = false;
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.renderOrder = 1;
    scene.add(this.mesh);
  }

  reset() {
    const positions = new Float32Array(this.maxQuads * POINTS_PER_QUAD * 3);
    this.mesh.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.quadIndex = 0;
    this.samples = [];
  }

  advance() {
    const sample = this.sample();

    if (this.samples.length > 0) {
      const previousSample = this.samples[this.samples.length - 1];

      const direction = sample.clone().sub(previousSample);
      if (direction.length() === 0) return;

      direction.normalize();
      const right = direction.cross(new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(this.width);
      const left = new THREE.Vector3(-right.x, -right.y, -right.z);

      const positions = this.mesh.geometry.attributes.position.array as Float32Array;
      let index = this.quadIndex * POINTS_PER_QUAD * 3;
      if (index + POINTS_PER_QUAD * 3 > positions.length) {
        this.quadIndex = 0;
        this.samples = [];
        index = 0;
      }

      setPoint(positions, index, previousSample.clone().add(left));
      setPoint(positions, index + 3, sample.clone().add(right));
      setPoint(positions, index + 6, sample.clone().add(left));

      setPoint(positions, index + 9, previousSample.clone().add(left));
      setPoint(positions, index + 12, previousSample.clone().add(right));
      setPoint(positions, index + 15, sample.clone().add(right));

      this.mesh.geometry.attributes.position.needsUpdate = true;
      this.mesh.geometry.computeBoundingBox();
      this.mesh.geometry.computeBoundingSphere();

      this.quadIndex++;
    }
    
    this.samples.push(sample);
  }

  sample() {
    const worldPosition = new THREE.Vector3();
    this.target.getWorldPosition(worldPosition);
    return worldPosition;
  }
}