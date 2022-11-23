import * as THREE from "three";
import { Vec3 } from "../parser/types";
import { BlockMesh } from "./block";

export function createDeco(name: string): BlockMesh {
  return {
    mesh: new THREE.Mesh(),
    rotation: Vec3.zero(),
    pivot: Vec3.zero()
  };
}