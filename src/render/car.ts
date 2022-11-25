import * as THREE from "three";
import { Sample } from "../parser/nodes";
import { Trail } from "./trail";
const { GLTFLoader } = require("three/addons/loaders/GLTFLoader.js");

export class Car {

  loaded: boolean = false;

  model: THREE.Object3D = new THREE.Object3D();
  wheelFrontLeft?: THREE.Object3D;
  wheelFrontRight?: THREE.Object3D;
  wheelBackLeft?: THREE.Object3D;
  wheelBackRight?: THREE.Object3D;

  wheels: THREE.Object3D[] = [];
  frontWheels: THREE.Object3D[] = [];
  wheelTrails: Trail[] = [];

  wheelRotation = 0;
  wheelAngle = 0;

  load(scene: THREE.Scene) {
    const loader = new GLTFLoader();

    loader.load(
      "models/car.glb",
  
      // onLoad callback
      (obj: any) => {
        this.model = obj.scene;
        this.model.traverse((node: any) => {
          if (node.name === 'WheelFrontLeft') {
            this.wheelFrontLeft = node;
            this.wheels.push(node);
            this.frontWheels.push(node);
          }

          if (node.name === 'WheelFrontRight') {
            this.wheelFrontRight = node;
            this.wheels.push(node);
            this.frontWheels.push(node);
          }

          if (node.name === 'WheelBackLeft') {
            this.wheelBackLeft = node;
            this.wheels.push(node);
          }

          if (node.name === 'WheelBackRight') {
            this.wheelBackRight = node;
            this.wheels.push(node);
          }
  
          node.castShadow = true;
        });
  
        for (const wheel of this.wheels) {
          // specify points to create planar trail-head geometry
          var trailHeadGeometry = [];
          trailHeadGeometry.push( 
            new THREE.Vector3( -1.0, 0.0, 0.0 ), 
            new THREE.Vector3( 0.0, 0.0, 0.0 ), 
            new THREE.Vector3( 1.0, 0.0, 0.0 ) 
          );
  
          const trail = new Trail(scene, wheel, new THREE.Vector3( 0.0, 0.0, 0.0 ));
  
          this.wheelTrails.push(trail);
        }
        
        scene.add(this.model);

        this.loaded = true;
      },
  
      undefined, // onProgress callback
  
      // onError callback
      (err: any) => {
        console.error("An error happened");
        console.error(err);
      }
    );
  }

  resetTrails() {
    for (const trail of this.wheelTrails) {
      trail.reset();
    }
  }

  update(delta: number, sample: Sample) {
    if (!sample.transform) return;
    
    const samplePosition = sample.transform.position;
    this.model.position.set(samplePosition.x, samplePosition.y, samplePosition.z);
    this.model.rotation.setFromQuaternion(sample.transform.rotation.toTHREE());

    const steer = sample.steer || 0;
    const diff = steer - this.wheelAngle;
    if (diff < 0) {
      this.wheelAngle = Math.max(steer, this.wheelAngle - delta * 10);
    } else if (diff > 0) {
      this.wheelAngle = Math.min(steer, this.wheelAngle + delta * 10);
    }

    for (const wheel of this.wheels) {
      this.wheelRotation += sample.transform.speed * 0.1 * delta;

      wheel.rotation.set(
        this.wheelRotation, 
        this.frontWheels.includes(wheel) ? this.wheelAngle * -0.35 : 0, 
        0,
        'YXZ'
      );
    }
    
    for (const trail of this.wheelTrails) {
      trail.advance();
    }
  }
}