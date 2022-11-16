import { Color, Vec3 } from "../parser/types";
import { hexToSrgb } from "../utils/color";
import { BlockMesh } from "./block";
import { chicane, concave, convex, curve, CurveDescription, flat, loop, pipe, raised, slope, straight, tilt, up } from "./curve";
import { createSurface, getMiddlePointCount, getMiddlePoints, getTrackSurface, Surface, trackHeight } from "./surface";

const edgeColor = hexToSrgb('#444444');
const bottomColor = new Color(0, 0, 0);

const platforms: {[name: string]: () => CurveDescription} = {
  PlatformTechBase: () => ({
    curves: [straight()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),

  PlatformTechSlope2Base: () => ({
    curves: [slope()],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0)
  }),
  PlatformTechSlopeBase: () => ({
    curves: [slope()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),

  PlatformTechSlope2Straight: () => ({
    curves: [straight(), raised(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  PlatformTechSlope2Start: () => ({
    curves: [straight(), convex(), raised(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  PlatformTechSlope2End: () => ({
    curves: [straight(), concave(), raised(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),

  PlatformTechSlope2UTop: () => ({
    curves: [straight(), concave()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  PlatformTechSlope2UBottom: () => ({
    curves: [straight(), convex(), up(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  PlatformTechSlope2UBottomInGround: () => ({
    curves: [straight(), convex()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),

  PlatformTechSlope2Curve1In: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0)
  }),
  PlatformTechSlope2Curve2In: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(2, 2, 2),
    offset: new Vec3(0, -2, 0)
  }),
  PlatformTechSlope2Curve3In: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(3, 2, 3),
    offset: new Vec3(0, -2, 0)
  }),

  PlatformTechSlope2Curve1Out: () => ({
    curves: [curve(), tilt(true)],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0)
  }),
  PlatformTechSlope2Curve2Out: () => ({
    curves: [curve(), tilt(true)],
    size: new Vec3(2, 2, 2),
    offset: new Vec3(0, -2, 0)
  }),
  PlatformTechSlope2Curve3Out: () => ({
    curves: [curve(), tilt(true)],
    size: new Vec3(3, 2, 3),
    offset: new Vec3(0, -2, 0)
  }),

  PlatformTechTiltTransition1UpLeft: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0)
  }),
  PlatformTechTiltTransition2UpLeft: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0)
  }),

  PlatformTechTiltTransition1UpRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0)
  }),
  PlatformTechTiltTransition2UpRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0)
  }),

  PlatformTechTiltTransition1DownLeft: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5), up(1, (r, t) => (r + 1) * 0.5)],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0)
  }),
  PlatformTechTiltTransition2DownLeft: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5), up(1, (r, t) => (r + 1) * 0.5)],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0)
  }),

  PlatformTechTiltTransition1DownRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5), up(1, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0)
  }),
  PlatformTechTiltTransition2DownRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5), up(1, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0)
  }),

  PlatformTechLoopStart: () => ({
    curves: [loop()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0)
  }),
  PlatformTechSlope2LoopStart: () => ({
    curves: [loop()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0)
  }),

  PlatformTechLoopStartCurve1In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0)
  }),
  PlatformTechLoopStartCurve2In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, -4, 0)
  }),
  PlatformTechLoopStartCurve3In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, -4, 0)
  }),

  PlatformTechLoopStartCurve0Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0)
  }),
  PlatformTechLoopStartCurve1Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, -4, 0)
  }),
  PlatformTechLoopStartCurve2Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, -4, 0)
  }),
  PlatformTechLoopStartCurve3Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(4, 4, 4),
    offset: new Vec3(0, -4, 0)
  }),
}

function getPlatformSurface(name: string): Surface {
  const surface = getTrackSurface(name, -1, 1);

  const points = [
    ...surface.points,
    ...getMiddlePoints(1, -1, 0),
  ];

  const colors = [
    edgeColor,

    ...surface.colors,

    edgeColor,

    ...(new Array(getMiddlePointCount(1, -1, 0) - 1).fill(bottomColor)),
    edgeColor,
  ];

  return {...surface, points, colors};
}

export function getPlatformCurve(name: string): CurveDescription {
  if (!(name in platforms)) return {
    curves: [straight()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  };

  return platforms[name]();
}

export function createPlatform(name: string): BlockMesh {
  const curve = getPlatformCurve(name);
  const surface = getPlatformSurface(name);
  return createSurface(name, surface, curve);
}