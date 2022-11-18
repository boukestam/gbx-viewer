import MapParser from "./parser";

export function parseCGameCtnMediaBlockDOFKey(p: MapParser, version: number) {
  const time = p.float();

  const zFocus = p.float();
  const lensSize = p.float();

  let target, targetPosition;

  if (version >= 1) {
    target = p.int32();

    if (version >= 2) {
      targetPosition = p.vec3();
    }
  }

  return {time, zFocus, lensSize, target, targetPosition};
}