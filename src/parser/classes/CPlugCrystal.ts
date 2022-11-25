import GameBoxParser from "../parser";
import { Node, Vec2, Vec3 } from "../types";

export enum ELayerType {
  Geometry,
  Smooth,
  Translation,
  Rotation,
  Scale,
  Mirror,
  U07,
  U08,
  Subdivide,
  Chaos,
  U11,
  U12,
  Deformation,
  Cubes,
  Trigger,
  SpawnPosition
};

function parseCrystal(p: GameBoxParser, materials: any[] | null) {
  const version = p.int32();

  p.skip(36);

  const groups = p.list(() => {
    if (version >= 31) p.skip(4);

    if (version >= 36) {
      p.skip(1);
    } else {
      p.skip(4);
    }

    p.skip(4);

    const name = p.string();

    p.skip(4);

    p.list(() => p.int32());

    return {version, name};
  });

  if (version < 21) {
    throw new Error("Crystal version not supported");
  }

  let isEmbeddedCrystal = false;

  if (version >= 25) {
    if (version < 29) {
      isEmbeddedCrystal = p.bool();
      isEmbeddedCrystal = p.bool();
    }

    isEmbeddedCrystal = p.bool(version >= 34);

    if (version >= 33) {
      p.skip(8);
    }
  }

  let positions: Vec3[] = [];
  let edges: Vec2[] = [];
  let faces: any[] = [];

  if (isEmbeddedCrystal) {
    positions = p.list(() => p.vec3());

    const edgesCount = p.int32();

    if (version >= 35) {
      const unfacedEdgesCount = p.int32();
      const unfacedEdges = p.optimizedIntArray(unfacedEdgesCount * 2);
    }

    edges = p.list(() => p.int2(), version >= 35 ? 0 : edgesCount);

    const facesCount = p.int32();

    let uvs: Vec2[] | null = null;
    let faceIndicies: number[] | null = null;

    if (version >= 37) {
      uvs = p.list(() => p.vec2());
      faceIndicies = p.optimizedIntArray(p.int32());
    }

    let indiciesCounter = 0;

    faces = p.list(() => {
      const vertCount = version >= 35 ? (p.byte() + 3) : p.int32();
      const inds = version >= 34 ? p.optimizedIntArray(vertCount, positions.length) : p.list(() => p.int32(), vertCount);

      const verts: any[] = [];

      if (version < 27) {
        const uvCount = Math.min(p.int32(), vertCount);

        for (let i = 0; i < uvCount; i++) {
          verts[i] = {
            position: positions[inds[i]],
            uv: p.vec2()
          };
        }

        p.vec3();
      } else if (version < 37) {
        for (let i = 0; i < vertCount; i++) {
          verts[i] = {
            position: positions[inds[i]],
            uv: p.vec2()
          };
        }
      } else if (uvs && faceIndicies) {
        for (let i = 0; i < vertCount; i++) {
          verts[i] = {
            position: positions[inds[i]],
            uv: uvs[faceIndicies[indiciesCounter]]
          };
          indiciesCounter++;
        }
      }

      let materialIndex = -1;

      if (version >= 25) {
        if (version >= 33) {
          materialIndex = materials ? p.optimizedInt(materials.length) : p.int32();
        } else {
          materialIndex = p.int32();
        }
      }

      const groupIndex = version >= 33 ? p.optimizedInt(groups.length) : p.int32();

      const material = materialIndex != -1 ? materials?.[materialIndex] : null;

      return {verts, group: groups[groupIndex], material};
    }, facesCount);
  } else {
    throw new Error("Unsupported crystal");
  }

  for (const face of faces) {
    if (!isEmbeddedCrystal) p.skip(4);
    if (version < 30 || !isEmbeddedCrystal) p.skip(4);
    if (version >= 22 && !isEmbeddedCrystal) p.skip(4);
  }

  for (const pos of positions) {
    if (version < 29) p.skip(4);
  }

  p.skip(4);

  if (version >= 7 && version < 32) {
    p.skip(4);

    if (version >= 10) {
      p.skip(4);
      p.string();

      if (version < 30) p.list(() => p.float());
    }
  }

  if (version < 36) {
    const numFaces = p.int32();
    const numEdges = p.int32();
    const numVerts = p.int32();

    p.list(() => p.int32(), numFaces);
    p.list(() => p.int32(), numEdges);
    p.list(() => p.int32(), numVerts);

    p.skip(4);
  }

  return {version, positions, faces, groups};
}

function parseGeometryLayer(p: GameBoxParser, node: Node, version: number, materials: any[] | null) {
  const crystal = parseCrystal(p, materials);

  p.list(() => p.int32());

  let collidable = true;
  let visible = true;

  if (version >= 1) {
    visible = p.bool();
    collidable = p.bool();
  }

  return {...crystal, collidable, visible};
}

function parseTriggerLayer(p: GameBoxParser, node: Node, version: number, materials: any[] | null) {
  const crystal = parseCrystal(p, materials);

  if (version >= 1) p.list(() => p.int32());

  return crystal;
}

function parseCubesLayer(p: GameBoxParser, node: Node, version: number) {
  p.skip(1);

  const voxelSize = p.float();

  if (version >= 4) p.vec3();

  const voxelModelArray = p.int32();
  const voxelModelArray2 = p.int32();

  if (version >= 2) {
    p.skip(8);
  }

  return {voxelSize, voxelModelArray, voxelModelArray2};
}

function parseMaskLayer(p: GameBoxParser, node: Node, version: number, type: number) {
  const mask = p.list(() => {
    const groupIndex = p.int32();
    const layerId = p.lookBackString();
    return {groupIndex, layerId};
  });

  const maskVersion = p.int32();

  if (type === ELayerType.Scale) {
    const scale = p.vec3();
    const independent = p.bool();
    return {mask, maskVersion, scale, independent};
  }

  if (type === ELayerType.SpawnPosition) {
    const position = p.vec3();
    const horizontalAngle = p.float();
    const verticalAngle = p.float();
    let rollAngle = 0;

    if (maskVersion >= 1) rollAngle = p.float();

    return {mask, maskVersion, position, horizontalAngle, verticalAngle, rollAngle};
  }

  if (type === ELayerType.Translation) {
    const translation = p.vec3();

    return {mask, maskVersion, translation};
  }

  if (type === ELayerType.Rotation) {
    const rotation = p.float();
    const axis = p.int32();
    const independent = p.bool();

    return {mask, maskVersion, rotation, axis, independent};
  }

  if (type === ELayerType.Mirror) {
    const axis = p.int32();
    const distance = p.float();
    const independent = p.bool();

    return {mask, maskVersion, axis, distance, independent};
  }

  if (type === ELayerType.Deformation) {
    throw new Error("Deformation layer is not supported");
  }

  if (type === ELayerType.Chaos) {
    const minDistance = p.float();
    p.skip(4);
    const maxDistance = p.float();

    return {mask, maskVersion, minDistance, maxDistance};
  }

  if (type === ELayerType.Subdivide) {
    const subdivisions = p.int32();

    return {mask, maskVersion, subdivisions};
  }

  if (type === ELayerType.Smooth) {
    const intensity = p.int32();

    return {mask, maskVersion, intensity};
  }

  throw new Error("Layer type not supported: " + type);
}

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x09003000) {
    const version = p.int32();

    const layers = [{
      layerId: "Layer0",
      layerName: "Geometry",
      type: ELayerType.Geometry,
      isEnabled: true,
      ...parseCrystal(p, node.materials)
    }];

    return {layers};
  } else if (chunkId === 0x09003003) {
    const version = p.int32();

    const materials = p.list(() => {
      const name = p.string();

      if (name.length > 0) return name;

      return p.nodeRef();
    });

    return {materials};
  } else if (chunkId === 0x09003005) {
    const version = p.int32();

    const layers = p.list(() => {
      const type = p.int32();
      const version = p.int32();

      p.skip(4);

      const layerId = p.lookBackString();
      const layerName = p.string();
      let isEnabled = true;

      if (version >= 1) isEnabled = p.bool();

      const typeVersion = p.int32();

      let layer;

      if (type === ELayerType.Geometry) layer = parseGeometryLayer(p, node, typeVersion, node.materials);
      else if (type === ELayerType.Trigger) layer = parseTriggerLayer(p, node, typeVersion, node.materials);
      else if (type === ELayerType.Cubes) layer = parseCubesLayer(p, node, typeVersion);
      else layer = parseMaskLayer(p, node, typeVersion, type);

      return {type, layerId, layerName, isEnabled, ...layer};
    });

    return {layers};
  } else if (chunkId === 0x09003006) {
    const version = p.int32();

    if (version === 0) {
      p.list(() => p.vec2());
    }

    if (version >= 1) {
      p.list(() => p.uint32());

      if (version >= 2) {
        p.optimizedIntArray(p.int32());
      }
    }

    return true;
  } else if (chunkId === 0x09003007) {
    const version = p.int32();

    p.list(() => p.float());
    p.list(() => p.int32());

    return true;
  }
}