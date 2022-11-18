import * as THREE from "three";
import { createAnchoredObject, createBlock } from "../blocks/block";
import { CGameCtnChallenge } from "../parser/nodes";
import { Vec3 } from "../parser/types";

export function loadBlocks(map: CGameCtnChallenge, scene: THREE.Scene) {
  let trackCenter = Vec3.zero();
  let blockCount = 0;

  for (const block of map.blocks) {
    const blockMesh = createBlock(block.blockName);

    const mesh = blockMesh.mesh.clone();

    const pos = new Vec3(block.x * 32, block.y * 8 - 64, block.z * 32).sub(
      blockMesh.offset
    );

    mesh.rotateY(
      -block.rotation * (Math.PI / 2) + Math.PI + blockMesh.rotation.y
    );
    mesh.rotateX(blockMesh.rotation.x);
    mesh.rotateZ(blockMesh.rotation.z);
    mesh.position.set(pos.x, pos.y, pos.z);

    trackCenter = trackCenter.add(pos);
    blockCount++;

    scene.add(mesh);
  }

  if (map.anchoredObjects) {
    for (const object of map.anchoredObjects) {
      const blockMesh = createAnchoredObject(object, map);

      const mesh = blockMesh.mesh.clone();

      mesh.position.set(object.pivotPosition.x, object.pivotPosition.y, object.pivotPosition.z);

      const pivot = new THREE.Group();
      pivot.add(mesh);

      pivot.rotateOnAxis(new Vec3(0, 1, 0).toTHREE(), object.pitchYawRoll.x);

      pivot.position.set(object.absolutePositionInMap.x, object.absolutePositionInMap.y, object.absolutePositionInMap.z);

      trackCenter = trackCenter.add(object.absolutePositionInMap);
      blockCount++;

      scene.add(pivot);
    }
  }

  return trackCenter.div(blockCount);
}