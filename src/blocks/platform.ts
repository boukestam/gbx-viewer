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
 Base: () => ({
    curves: [straight()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),

 Slope2Base: () => ({
    curves: [slope()],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
 SlopeBase: () => ({
    curves: [slope()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),

 Slope2Straight: () => ({
    curves: [straight(), raised(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),
 Slope2Start: () => ({
    curves: [straight(), convex(), raised(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),
 Slope2End: () => ({
    curves: [straight(), concave(), raised(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),

 Slope2UTop: () => ({
    curves: [straight(), concave()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),
 Slope2UBottom: () => ({
    curves: [straight(), convex(), up(2)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),
 Slope2UBottomInGround: () => ({
    curves: [straight(), convex()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0),
  }),

 Slope2Curve1In: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
 Slope2Curve2In: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(2, 2, 2),
    offset: new Vec3(0, -2, 0),
  }),
 Slope2Curve3In: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(3, 2, 3),
    offset: new Vec3(0, -2, 0),
  }),

 Slope2Curve1Out: () => ({
    curves: [curve(), tilt(true)],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
 Slope2Curve2Out: () => ({
    curves: [curve(), tilt(true)],
    size: new Vec3(2, 2, 2),
    offset: new Vec3(0, -2, 0),
  }),
 Slope2Curve3Out: () => ({
    curves: [curve(), tilt(true)],
    size: new Vec3(3, 2, 3),
    offset: new Vec3(0, -2, 0),
  }),

 TiltTransition1UpLeft: () => ({
    curves: [
      flat((r, t) => (r + 1) * 0.5),
      slope(false, (r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
 TiltTransition2UpLeft: () => ({
    curves: [
      flat((r, t) => (r + 1) * 0.5),
      slope(false, (r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0),
  }),

 TiltTransition1UpRight: () => ({
    curves: [
      slope(false, (r, t) => (r + 1) * 0.5),
      flat((r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
 TiltTransition2UpRight: () => ({
    curves: [
      slope(false, (r, t) => (r + 1) * 0.5),
      flat((r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0),
  }),

 TiltTransition1DownLeft: () => ({
    curves: [
      flat((r, t) => (r + 1) * 0.5),
      slope(false, (r, t) => (r - 1) * -0.5),
      up(1, (r, t) => (r + 1) * 0.5),
    ],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
 TiltTransition2DownLeft: () => ({
    curves: [
      flat((r, t) => (r + 1) * 0.5),
      slope(false, (r, t) => (r - 1) * -0.5),
      up(1, (r, t) => (r + 1) * 0.5),
    ],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0),
  }),

 TiltTransition1DownRight: () => ({
    curves: [
      slope(false, (r, t) => (r + 1) * 0.5),
      flat((r, t) => (r - 1) * -0.5),
      up(1, (r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0),
  }),
 TiltTransition2DownRight: () => ({
    curves: [
      slope(false, (r, t) => (r + 1) * 0.5),
      flat((r, t) => (r - 1) * -0.5),
      up(1, (r, t) => (r - 1) * -0.5),
    ],
    size: new Vec3(1, 2, 2),
    offset: new Vec3(1, -2, 0),
  }),

 LoopStart: () => ({
    curves: [loop()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),
 Slope2LoopStart: () => ({
    curves: [loop()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),

 LoopStartCurve1In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),
 LoopStartCurve2In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, -4, 0),
  }),
 LoopStartCurve3In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, -4, 0),
  }),

 LoopStartCurve0Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),
 LoopStartCurve1Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, -4, 0),
  }),
 LoopStartCurve2Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, -4, 0),
  }),
 LoopStartCurve3Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(4, 4, 4),
    offset: new Vec3(0, -4, 0),
  }),

 LoopOutStart: () => ({
    curves: [loop(true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),

 LoopOutStartCurve1: () => ({
    curves: [curve(), pipe(true, true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, -4, 0),
  }),
 LoopOutStartCurve2: () => ({
    curves: [curve(), pipe(true, true)],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, -4, 0),
  }),
 LoopOutStartCurve3: () => ({
    curves: [curve(), pipe(true, true)],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, -4, 0),
  }),

 LoopOutStartCurve1In: () => ({
    curves: [curve(), pipe(false, true)],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, -4, -2),
  }),
 LoopOutStartCurve2In: () => ({
    curves: [curve(), pipe(false, true)],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, -4, -2),
  }),
 LoopOutStartCurve3In: () => ({
    curves: [curve(), pipe(false, true)],
    size: new Vec3(4, 4, 4),
    offset: new Vec3(0, -4, -2),
  }),

 LoopEnd: () => ({
    curves: [loop()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI, 0)
  }),

 LoopEndCurve1In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * -0.5, 0)
  }),
 LoopEndCurve2In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * -0.5, 0)
  }),
 LoopEndCurve3In: () => ({
    curves: [curve(), pipe()],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * -0.5, 0)
  }),

 LoopEndCurve0Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * 0.5, 0)
  }),
 LoopEndCurve1Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(2, 4, 2),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * 0.5, 0)
  }),
 LoopEndCurve2Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(3, 4, 3),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * 0.5, 0)
  }),
 LoopEndCurve3Out: () => ({
    curves: [curve(), pipe(true)],
    size: new Vec3(4, 4, 4),
    offset: new Vec3(0, 4, 0),
    rotation: new Vec3(Math.PI, Math.PI * 0.5, 0)
  }),

 WallCurve3x4: () => ({
    curves: [loop()],
    size: new Vec3(1, 12, 3),
    offset: new Vec3(2, -8, -3),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),
 WallCurve2x4: () => ({
    curves: [loop()],
    size: new Vec3(1, 8, 2),
    offset: new Vec3(1, -4, -2),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),
 WallCurve1x4: () => ({
    curves: [loop()],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(0, 0, -1),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),

 WallCurve3: () => ({
    curves: [loop()],
    size: new Vec3(0.25, 12, 3),
    offset: new Vec3(3, -11, -3),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),
 WallCurve2: () => ({
    curves: [loop()],
    size: new Vec3(0.25, 8, 2),
    offset: new Vec3(2, -7, -2),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),
 WallCurve1: () => ({
    curves: [loop()],
    size: new Vec3(0.25, 4, 1),
    offset: new Vec3(1, -3, -1),
    rotation: new Vec3(0, Math.PI * 0.5, Math.PI * -0.5)
  }),

 WallOutCurve3x4: () => ({
    curves: [loop(true)],
    size: new Vec3(1, 12, 3),
    offset: new Vec3(-1, -8, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),
 WallOutCurve2x4: () => ({
    curves: [loop(true)],
    size: new Vec3(1, 8, 2),
    offset: new Vec3(-1, -4, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),
 WallOutCurve1x4: () => ({
    curves: [loop(true)],
    size: new Vec3(1, 4, 1),
    offset: new Vec3(-1, 0, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),

 WallOutCurve3: () => ({
    curves: [loop(true)],
    size: new Vec3(0.25, 12, 3),
    offset: new Vec3(-1, -11, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),
 WallOutCurve2: () => ({
    curves: [loop(true)],
    size: new Vec3(0.25, 8, 2),
    offset: new Vec3(-1, -7, 0),
    rotation: new Vec3(0, 0, Math.PI * 0.5)
  }),
 WallOutCurve1: () => ({
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
  name = name.replace(/Platform(Tech|Dirt|Ice|Platform)/, "");

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
