import * as THREE from "three";
import { Vec3 } from "../parser/types";
import { BlockMesh } from "./block";

export function createDeco(name: string): BlockMesh {
  return {
    mesh: new THREE.Mesh(),
    offset: Vec3.zero(),
    rotation: Vec3.zero()
  };
}