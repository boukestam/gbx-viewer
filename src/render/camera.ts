import * as THREE from "three";
import { Sample } from "../parser/nodes";
import { Transform, Vec3 } from "../parser/types";

export class Camera extends THREE.PerspectiveCamera {

  listeners: any = {};
  keys: { [key: string]: boolean } = {};

  controlType: 'follow' | 'free' = 'free';

  init(trackCenter: Vec3) {
    this.position.x = 1000;
    this.position.y = 100;
    this.position.z = 900;
    this.lookAt(trackCenter.toTHREE());
  }

  start() {
    this.listeners.keydownListener = (e: KeyboardEvent) => {
      this.keys[e.key] = true;
    };
    this.listeners.keyupListener = (e: KeyboardEvent) => {
      this.keys[e.key] = false;
    };
  
    this.listeners.mousedownListener = (e: MouseEvent) => {
      this.keys["Mouse" + e.button] = true;
    };
    this.listeners.mouseupListener = (e: MouseEvent) => {
      this.keys["Mouse" + e.button] = false;
    };
    this.listeners.mousemoveListener = (e: MouseEvent) => {
      if (this.keys["Mouse0"]) {
        this.rotateOnWorldAxis(
          new THREE.Vector3(0, 1, 0),
          -e.movementX * 0.002
        );
        this.rotateOnAxis(new THREE.Vector3(1, 0, 0), -e.movementY * 0.002);
      }
    };

    document.addEventListener("keydown", this.listeners.keydownListener);
    document.addEventListener("keyup", this.listeners.keyupListener);
    document.addEventListener("mouseup", this.listeners.mouseupListener);
    document.addEventListener("mousedown", this.listeners.mousedownListener);
    document.addEventListener("mousemove", this.listeners.mousemoveListener);
  }

  update(delta: number, car: THREE.Object3D, sun: THREE.DirectionalLight, currentSample: Sample, nextSample: Sample) {
    if (this.controlType === "follow" && car) {
      const sampleTransform = currentSample.transform as Transform;

      const sampleVelocity = nextSample
        .transform!.position.sub(sampleTransform.position)
        .toTHREE()
        .normalize();
      const cameraPosition = car.position
        .clone()
        .sub(sampleVelocity.multiplyScalar(20));
        this.position.set(
        cameraPosition.x,
        cameraPosition.y + 8,
        cameraPosition.z
      );
      this.lookAt(car.position);

      sun.position.set(car.position.x, car.position.y + 500, car.position.z);
      sun.target = car;
    } else if (this.controlType === "free") {
      const direction = new THREE.Vector3();
      this.getWorldDirection(direction);
      const right = direction
        .clone()
        .cross(new THREE.Vector3(0, 1, 0))
        .normalize();
      const speed = 250 * delta;
      if (this.keys["ArrowUp"] || this.keys["w"]) {
        this.position.addScaledVector(direction, speed);
      }
      if (this.keys["ArrowDown"] || this.keys["s"]) {
        this.position.addScaledVector(direction, -speed);
      }
      if (this.keys["ArrowLeft"] || this.keys["a"]) {
        this.position.addScaledVector(right, -speed);
      }
      if (this.keys["ArrowRight"] || this.keys["d"]) {
        this.position.addScaledVector(right, speed);
      }
      if (this.keys["Shift"]) {
        this.position.addScaledVector(new THREE.Vector3(0, 1, 0), -speed);
      }
      if (this.keys[" "]) {
        this.position.addScaledVector(new THREE.Vector3(0, 1, 0), speed);
      }

      sun.position.set(
        this.position.x,
        this.position.y + 500,
        this.position.z
      );
      sun.target = this;
    }
  }

  dispose() {
    document.removeEventListener("keydown", this.listeners.keydownListener);
    document.removeEventListener("keyup", this.listeners.keyupListener);
    document.removeEventListener("mouseup", this.listeners.mouseupListener);
    document.removeEventListener("mousedown", this.listeners.mousedownListener);
    document.removeEventListener("mousemove", this.listeners.mousemoveListener);
  }
}