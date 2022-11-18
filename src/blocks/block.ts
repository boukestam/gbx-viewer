import { CGameCtnAnchoredObject, CGameCtnChallenge } from "../parser/nodes";
import { Vec3 } from "../parser/types";
import { createDeco } from "./deco";
import { createCrystal } from "./mesh";
import { createPlatform } from "./platform";
import { createRoad } from "./road";

export interface BlockMesh {
  mesh: THREE.Mesh;
  offset: Vec3;
  rotation: Vec3;
}

export function createBlock(name: string): BlockMesh {
  if (name.includes("Road")) return createRoad(name);
  if (name.startsWith("Deco")) return createDeco(name);
  if (name.startsWith("Platform")) return createPlatform(name);

  return createDeco(name);
  
  //throw new Error("Unknown block type: " + name);
}

export function createAnchoredObject(object: CGameCtnAnchoredObject, map: CGameCtnChallenge): BlockMesh {
  if (!map.embeddedData) return createBlock("");
  
  const item = Object.values(map.embeddedData).find((item) => item.body.info[0] === object.itemModel[0]);

  if (item) {
    const crystal = item.body.entityModelEdition.meshCrystal;
    return createCrystal(crystal);
  }

  return createBlock("");
}