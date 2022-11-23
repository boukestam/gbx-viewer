import * as THREE from "three";
import { BlockMesh, createAnchoredObject, createBlock } from "../blocks/block";
import { CGameCtnChallenge } from "../parser/nodes";
import { Vec3 } from "../parser/types";

export function loadBlocks(map: CGameCtnChallenge, scene: THREE.Scene) {
  let trackCenter = Vec3.zero();
  let blockCount = 0;

  const addPivot = (blockMesh: BlockMesh, position: Vec3, pivotPosition: Vec3, rotation: Vec3) => {
    const mesh = blockMesh.mesh.clone();

    mesh.position.set(pivotPosition.x, pivotPosition.y, pivotPosition.z);

    const pivot = new THREE.Group();
    pivot.add(mesh);

    pivot.rotateOnAxis(new Vec3(0, 1, 0).toTHREE(), rotation.y);

    pivot.position.set(position.x, position.y, position.z);

    trackCenter = trackCenter.add(position);
    blockCount++;

    scene.add(pivot);
  };

  for (const block of map.blocks) {
    const blockMesh = createBlock(block);

    const pos = new Vec3(block.x * 32, block.y * 8 - 64, block.z * 32);

    addPivot(
      blockMesh, 
      pos, 
      blockMesh.pivot, 
      new Vec3(0, -block.rotation * (Math.PI / 2) + Math.PI + blockMesh.rotation.y, 0)
    );
  }

  if (map.anchoredObjects) {
    for (const object of map.anchoredObjects) {
      const blockMesh = createAnchoredObject(object, map);

      addPivot(
        blockMesh, 
        object.absolutePositionInMap, 
        object.pivotPosition, 
        new Vec3(0, object.pitchYawRoll.x, 0)
      );
    }
  }

  return trackCenter.div(blockCount);
}