import GameBoxParser from "../parser";
import { Node } from "../types";

function parseMediaBlockCameraInterpVal(p: GameBoxParser, version: number) {
  const position = p.vec3();

  if (version < 6) {
    return { position };
  }

  const pitchYawRoll = p.vec3();
  const fov = p.float();
  const targetPosition = p.vec3();

  let nearZ;
  if (version >= 7) {
    nearZ = p.float();
  }

  return { position, pitchYawRoll, fov, targetPosition, nearZ };
}

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x030a2006) {
    const version = 6 + p.uint32();

    const keys = p.list(() => {
      const time = p.float();
      const interpolation = p.uint32();

      let position, pitchYawRoll, fov;
      let targetPosition;
      let leftTangent, rightTangent;

      if (version < 6) {
        p.skip(8);
        position = p.vec3();
        pitchYawRoll = p.vec3();
        fov = p.float();
      }

      const anchorRot = p.bool();
      const anchor = p.uint32();
      const anchorVis = p.bool();
      const target = p.uint32();

      if (version < 6) {
        targetPosition = p.vec3();

        if (version === 1) {
          p.skip(8);
          return true;
        }

        leftTangent = parseMediaBlockCameraInterpVal(p, version);
        rightTangent = parseMediaBlockCameraInterpVal(p, version);

        if (version === 3) {
          p.skip(20);
        }
      }

      let nearZ;

      if (version >= 6) {
        position = p.vec3();
        pitchYawRoll = p.vec3();
        fov = p.float();
        targetPosition = p.vec3();

        if (version >= 7) {
          nearZ = p.float();
        }

        leftTangent = parseMediaBlockCameraInterpVal(p, version);
        rightTangent = parseMediaBlockCameraInterpVal(p, version);

        if (version === 8) {
          p.skip(8);
        }

        if (version >= 10) {
          throw new Error("Unsupported CGameCtnMediaBlockCameraCustom version");
        }
      }

      return {
        time,
        interpolation,
        anchorRot,
        anchor,
        anchorVis,
        target,
        nearZ,
        position,
        pitchYawRoll,
        fov,
        targetPosition,
        leftTangent,
        rightTangent,
      };
    });

    return { version, keys };
  }
}