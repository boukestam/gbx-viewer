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

const cache: {[name: string]: BlockMesh} = {};

export function createBlock(name: string): BlockMesh {
  if (name in cache) return cache[name];

  let mesh;

  if (name.includes("Road")) mesh = createRoad(name);
  else if (name.startsWith("Deco")) mesh = createDeco(name);
  else if (name.startsWith("Platform")) mesh = createPlatform(name);
  else mesh = createDeco(name);

  cache[name] = mesh;

  return mesh;
  
  //throw new Error("Unknown block type: " + name);
}

export function createAnchoredObject(object: CGameCtnAnchoredObject, map: CGameCtnChallenge): BlockMesh {
  if (object.itemModel[0] in cache) return cache[object.itemModel[0]];
  
  if (!map.embeddedData) return createBlock("");
  
  const item = Object.values(map.embeddedData).find((item) => item.body.info[0] === object.itemModel[0]);

  if (item) {
    const crystal = item.body.entityModelEdition.meshCrystal;
    const mesh = createCrystal(crystal);
    cache[object.itemModel[0]] = mesh;
    return mesh;
  }

  return createBlock("");
}