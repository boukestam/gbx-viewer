import * as THREE from "three";
import { Vec3 } from "../parser/types";
import { BlockMesh } from "./block";

export function createPlatform(name: string): BlockMesh {
  return {
    mesh: new THREE.Mesh(),
    offset: Vec3.zero(),
    rotation: 0
  };
}