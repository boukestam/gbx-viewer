import { Color, Vec3 } from "../parser/types";
import { hexToSrgb } from "../utils/color";
import { BlockMesh } from "./block";
import {
  concave,
  convex,
  curve,
  CurveDescription,
  flat,
  loop,
  pipe,
  raised,
  slope,
  straight,
  tilt,
  up,
} from "./curve";
import {
  createSurface,
  getMiddlePointCount,
  getMiddlePoints,
  getTrackSurface,
  Surface,
} from "./surface";

const edgeColor = hexToSrgb("#444444");
const bottomColor = new Color(0, 0, 0);

const platforms: { [name: string]: () => CurveDescription } = {
  PlatformTechBase: () => ({
    curves: [straight()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),

  PlatformTechSlope2Base: () => ({
    curves: [slope()],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
  PlatformTechSlopeBase: () => ({
    curves: [slope()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),

  PlatformTechSlope2Straight: () => ({
    curves: [straight(), raised(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),
  PlatformTechSlope2Start: () => ({
    curves: [straight(), convex(), raised(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),
  PlatformTechSlope2End: () => ({
    curves: [straight(), concave(), raised(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),

  PlatformTechSlope2UTop: () => ({
    curves: [straight(), concave()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),
  PlatformTechSlope2UBottom: () => ({
    curves: [straight(), convex(), up(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),
  PlatformTechSlope2UBottomInGround: () => ({
    curves: [straight(), convex()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),

  PlatformTechSlope2Curve1In: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
  PlatformTechSlope2Curve2In: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(2, 2, 2),
    offset: new Vec3(0, -2, 0),
  }),
  PlatformTechSlope2Curve3In: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(3, 2, 3),
    offset: new Vec3(0, -2, 0),
  }),

  PlatformTechSlope2Curve1Out: () => ({
    curves: [curve(), tilt(true)],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
  PlatformTechSlope2Curve2Out: () => ({
    curves: [curve(), tilt(true)],
    size: new Vec3(2, 2, 2),
    offset: new Vec3(0, -2, 0),
  }),
  PlatformTechSlope2Curve3Out: () => ({
    curves: [curve(), tilt(true)],
    size: new Vec3(3, 2, 3),
    offset: new Vec3(0, -2, 0),
  }),

  PlatformTechTiltTransition1UpLeft: () => ({
    curves: [
      flat((r, t) => (r + 1) * 0.5),
      slope(false, (r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
  PlatformTechTiltTransition2UpLeft: () => ({
    curves: [
      flat((r, t) => (r + 1) * 0.5),
      slope(false, (r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0),
  }),

  PlatformTechTiltTransition1UpRight: () => ({
    curves: [
      slope(false, (r, t) => (r + 1) * 0.5),
      flat((r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
  PlatformTechTiltTransition2UpRight: () => ({
    curves: [
      slope(false, (r, t) => (r + 1) * 0.5),
      flat((r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0),
  }),

  PlatformTechTiltTransition1DownLeft: () => ({
    curves: [
      flat((r, t) => (r + 1) * 0.5),
      slope(false, (r, t) => (r - 1) * -0.5),
      up(1, (r, t) => (r + 1) * 0.5),
    ],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
  PlatformTechTiltTransition2DownLeft: () => ({
    curves: [
      flat((r, t) => (r + 1) * 0.5),
      slope(false, (r, t) => (r - 1) * -0.5),
      up(1, (r, t) => (r + 1) * 0.5),
    ],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0),
  }),

  PlatformTechTiltTransition1DownRight: () => ({
    curves: [
      slope(false, (r, t) => (r + 1) * 0.5),
      flat((r, t) => (r - 1) * -0.5),
      up(1, (r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
  PlatformTechTiltTransition2DownRight: () => ({
    curves: [
      slope(false, (r, t) => (r + 1) * 0.5),
      flat((r, t) => (r - 1) * -0.5),
      up(1, (r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0),
  }),

  PlatformTechLoopStart: () => ({
    curves: [loop()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),
  PlatformTechSlope2LoopStart: () => ({
    curves: [loop()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),

  PlatformTechLoopStartCurve1In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),
  PlatformTechLoopStartCurve2In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, -4, 0),
  }),
  PlatformTechLoopStartCurve3In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, -4, 0),
  }),

  PlatformTechLoopStartCurve0Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),
  PlatformTechLoopStartCurve1Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, -4, 0),
  }),
  PlatformTechLoopStartCurve2Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, -4, 0),
  }),
  PlatformTechLoopStartCurve3Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(4, 4, 4),
    offset: new Vec3(0, -4, 0),
  }),

  PlatformTechLoopOutStart: () => ({
    curves: [loop(true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),

  PlatformTechLoopOutStartCurve1: () => ({
    curves: [curve(), pipe(true, true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),
  PlatformTechLoopOutStartCurve2: () => ({
    curves: [curve(), pipe(true, true)],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, -4, 0),
  }),
  PlatformTechLoopOutStartCurve3: () => ({
    curves: [curve(), pipe(true, true)],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, -4, 0),
  }),

  PlatformTechLoopOutStartCurve1In: () => ({
    curves: [curve(), pipe(false, true)],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, -4, -2),
  }),
  PlatformTechLoopOutStartCurve2In: () => ({
    curves: [curve(), pipe(false, true)],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, -4, -2),
  }),
  PlatformTechLoopOutStartCurve3In: () => ({
    curves: [curve(), pipe(false, true)],
    size: new Vec3(4, 4, 4),
    offset: new Vec3(0, -4, -2),
  }),

  PlatformTechLoopEnd: () => ({
    curves: [loop()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI, 0)
  }),

  PlatformTechLoopEndCurve1In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * -0.5, 0)
  }),
  PlatformTechLoopEndCurve2In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * -0.5, 0)
  }),
  PlatformTechLoopEndCurve3In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * -0.5, 0)
  }),

  PlatformTechLoopEndCurve0Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * 0.5, 0)
  }),
  PlatformTechLoopEndCurve1Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * 0.5, 0)
  }),
  PlatformTechLoopEndCurve2Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * 0.5, 0)
  }),
  PlatformTechLoopEndCurve3Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(4, 4, 4),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * 0.5, 0)
  }),

  PlatformTechWallCurve3x4: () => ({
    curves: [loop()],
    size: new Vec3(1, 12, 3),
    offset: new Vec3(2, -8, -3),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),
  PlatformTechWallCurve2x4: () => ({
    curves: [loop()],
    size: new Vec3(1, 8, 2),
    offset: new Vec3(1, -4, -2),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),
  PlatformTechWallCurve1x4: () => ({
    curves: [loop()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, 0, -1),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),

  PlatformTechWallCurve3: () => ({
    curves: [loop()],
    size: new Vec3(0.25, 12, 3),
    offset: new Vec3(3, -11, -3),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),
  PlatformTechWallCurve2: () => ({
    curves: [loop()],
    size: new Vec3(0.25, 8, 2),
    offset: new Vec3(2, -7, -2),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),
  PlatformTechWallCurve1: () => ({
    curves: [loop()],
    size: new Vec3(0.25, 4, 1),
    offset: new Vec3(1, -3, -1),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),

  PlatformTechWallOutCurve3x4: () => ({
    curves: [loop(true)],
    size: new Vec3(1, 12, 3),
    offset: new Vec3(-1, -8, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),
  PlatformTechWallOutCurve2x4: () => ({
    curves: [loop(true)],
    size: new Vec3(1, 8, 2),
    offset: new Vec3(-1, -4, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),
  PlatformTechWallOutCurve1x4: () => ({
    curves: [loop(true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(-1, 0, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),

  PlatformTechWallOutCurve3: () => ({
    curves: [loop(true)],
    size: new Vec3(0.25, 12, 3),
    offset: new Vec3(-1, -11, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),
  PlatformTechWallOutCurve2: () => ({
    curves: [loop(true)],
    size: new Vec3(0.25, 8, 2),
    offset: new Vec3(-1, -7, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),
  PlatformTechWallOutCurve1: () => ({
    curves: [loop(true)],
    size: new Vec3(0.25, 4, 1),
    offset: new Vec3(-1, -3, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),
};

function getPlatformSurface(name: string): Surface {
  const surface = getTrackSurface(name, -1, 1);

  const points = [...surface.points, ...getMiddlePoints(1, -1, 0)];

  const colors = [
    edgeColor,

    ...surface.colors,

    edgeColor,

    ...new Array(getMiddlePointCount(1, -1, 0) - 1).fill(bottomColor),
    edgeColor,
  ];

  return { ...surface, points, colors };
}

export function getPlatformCurve(name: string): CurveDescription {
  if (!(name in platforms))
    return {
      curves: [straight()],
      size: new Vec3(1, 1, 1),
      offset: new Vec3(0, -1, 0),
    };

  return platforms[name]();
}

export function createPlatform(name: string): BlockMesh {
  const curve = getPlatformCurve(name);
  const surface = getPlatformSurface(name);
  return createSurface(name, surface, curve);
}
