import { Vec3 } from "../parser/types";
import { createDeco } from "./deco";
import { createPlatform } from "./platform";
import { createRoad } from "./road";

export interface BlockMesh {
  mesh: THREE.Mesh;
  offset: Vec3;
  rotation: number;
}

export function createBlock(name: string): BlockMesh {
  if (name.startsWith("Road")) return createRoad(name);
  if (name.startsWith("Deco")) return createDeco(name);
  if (name.startsWith("Platform")) return createPlatform(name);
  throw new Error("Unknown block type: " + name);
}