import * as THREE from "three";
import { Vector3 } from "three";
import { BlockMesh, createAnchoredObject, createBlock, getBlockInfo } from "../blocks/block";
import { Block, CGameCtnChallenge } from "../parser/nodes";
import { Vec3 } from "../parser/types";
import { BLOCK_SIZE } from "../utils/constants";



function addPivot (scene: THREE.Scene, mesh: THREE.InstancedMesh, index: number, position: Vec3, pivotPosition: Vec3, rotation: Vec3) {
  const dummy = new THREE.Object3D();
  dummy.position.set(pivotPosition.x, pivotPosition.y, pivotPosition.z);
  
  const pivot = new THREE.Group();
  pivot.add(dummy);

  pivot.rotateOnAxis(new Vector3(1, 0, 0), rotation.x);
  pivot.rotateOnAxis(new Vector3(0, 1, 0), rotation.y);
  pivot.rotateOnAxis(new Vector3(0, 0, 1), rotation.z);

  pivot.position.set(position.x, position.y, position.z);
  pivot.matrixAutoUpdate = false;
  pivot.updateMatrix();
  pivot.updateWorldMatrix(false, true);

  mesh.setMatrixAt(index, dummy.matrixWorld);
  mesh.instanceMatrix.needsUpdate = true;

  if (index === 0) scene.add(mesh);
};

export function loadBlocks(map: CGameCtnChallenge, scene: THREE.Scene) {
  let trackCenter = Vec3.zero();
  let blockCount = 0;

  const blocks = map.blocks.concat(map.bakedBlocks);

  const counts: {[name: string]: number} = {};
  const meshes: {[name: string]: BlockMesh | null} = {};
  const indexes: {[name: string]: number} = {};

  // Count variants

  for (const block of blocks) {
    const {name} = getBlockInfo(block);
    if (name in counts) counts[name]++;
    else {
      counts[name] = 1;
      indexes[name] = 0;
    }
  }

  if (map.anchoredObjects) {
    for (const object of map.anchoredObjects) {
      if (object.itemModel[0] in counts) counts[object.itemModel[0]]++;
      else {
        counts[object.itemModel[0]] = 1;
        indexes[object.itemModel[0]] = 0;
      }
    }
  }

  // Create meshes

  for (const block of blocks) {
    const {name} = getBlockInfo(block);
    if (!(name in meshes)) meshes[name] = createBlock(block, counts[name]);
  }

  if (map.anchoredObjects) {
    for (const object of map.anchoredObjects) {
      if(!(object.itemModel[0] in meshes)) meshes[object.itemModel[0]] = createAnchoredObject(object, map, counts[object.itemModel[0]]);
    }
  }

  // Place objects

  for (const block of blocks) {
    const {name} = getBlockInfo(block);
    const blockMesh = meshes[name];
    if (!blockMesh) continue;

    if ((block.flags & 0x20000000) > 0) {
      // Free block
      addPivot(
        scene,
        blockMesh.mesh, 
        indexes[name],
        block.absolutePositionInMap || Vec3.zero(), 
        blockMesh.pivot || Vec3.zero(), 
        new Vec3(0, block.pitchYawRoll?.x || 0, 0)
      );

      trackCenter = trackCenter.add(block.absolutePositionInMap || Vec3.zero());
    } else {
      const pos = new Vec3(
        block.coord.x * BLOCK_SIZE.x + BLOCK_SIZE.x, 
        (block.coord.y - 8) * BLOCK_SIZE.y, 
        block.coord.z * BLOCK_SIZE.z + BLOCK_SIZE.z
      ).add(blockMesh.offset || Vec3.zero());

      addPivot(
        scene,
        blockMesh.mesh, 
        indexes[name],
        pos, 
        blockMesh.pivot || Vec3.zero(), 
        new Vec3(
          blockMesh.rotation?.x || 0, 
          -block.rotation * (Math.PI / 2) + Math.PI + (blockMesh.rotation?.y || 0), 
          blockMesh.rotation?.z || 0
        )
      );

      trackCenter = trackCenter.add(pos);
    }

    blockCount++;

    indexes[name]++;
  }

  if (map.anchoredObjects) {
    for (const object of map.anchoredObjects) {
      const blockMesh = meshes[object.itemModel[0]];
      if (!blockMesh) continue;

      addPivot(
        scene,
        blockMesh.mesh, 
        indexes[object.itemModel[0]],
        object.absolutePositionInMap, 
        object.pivotPosition, 
        new Vec3(0, object.pitchYawRoll.x, 0)
      );

      trackCenter = trackCenter.add(object.absolutePositionInMap);
      blockCount++;
      
      indexes[object.itemModel[0]]++;
    }
  }

  return {
    trackCenter: trackCenter.divScalar(blockCount),
    counts,
    meshes, 
    indexes
  };
}