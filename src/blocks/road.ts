import { Vec3 } from "../parser/types";
import { hexToSrgb } from "../utils/color";
import { BlockMesh } from "./block";
import { chicane, concave, convex, curve, CurveDescription, flat, raised, slope, straight, tilt, up } from "./curve";
import { createSurface, getTrackSurface, Surface, trackHeight } from "./surface";

const roadLeft = -0.9;
const roadRight = 0.9;
const borderHeight = 0.4;
const borderWidth = 0.125;
const trackLineWidth = 0.1875;

const borderColor = hexToSrgb('#ffffff');
const borderSideColor = hexToSrgb('#000000');
const edgeColor = hexToSrgb('#1D2633');

const roads: {[name: string]: () => CurveDescription} = {
  Straight: () => ({
    curves: [straight()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),

  Curve1: () => ({
    curves: [curve()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  Curve2: () => ({
    curves: [curve()],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  Curve3: () => ({
    curves: [curve()],
    size: new Vec3(3, 1, 3),
    offset: new Vec3(0, -1, 0)
  }),
  Curve4: () => ({
    curves: [curve()],
    size: new Vec3(4, 1, 4),
    offset: new Vec3(0, -1, 0)
  }),
  Curve5: () => ({
    curves: [curve()],
    size: new Vec3(5, 1, 5),
    offset: new Vec3(0, -1, 0)
  }),

  ChicaneX2Left: () => ({
    curves: [chicane(true)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  ChicaneX3Left: () => ({
    curves: [chicane(true)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),
  ChicaneX2Right: () => ({
    curves: [chicane(false)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  ChicaneX3Right: () => ({
    curves: [chicane(false)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),

  SlopeBase2: () => ({
    curves: [slope()],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0)
  }),
  SlopeBase: () => ({
    curves: [slope()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  SlopeBase2x1: () => ({
    curves: [slope()],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),

  SlopeStraight: () => ({
    curves: [straight(), raised(1)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  SlopeStart2x1: () => ({
    curves: [straight(), convex(), raised(2)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  SlopeEnd2x1: () => ({
    curves: [straight(), concave(), raised(2)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),

  SlopeUTop: () => ({
    curves: [straight(), concave(1)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  SlopeUTopX2: () => ({
    curves: [straight(), concave()],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  SlopeUBottom: () => ({
    curves: [straight(), convex(), up(1)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  SlopeUBottomX2: () => ({
    curves: [straight(), convex(), up(1)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  SlopeUBottomInGround: () => ({
    curves: [straight(), convex(1)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  SlopeUBottomX2InGround: () => ({
    curves: [straight(), convex(1.25)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),

  ChicaneX2SlopeLeft: () => ({
    curves: [chicane(true), raised(2)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  ChicaneX3SlopeLeft: () => ({
    curves: [chicane(true), raised(2)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),
  ChicaneX2SlopeRight: () => ({
    curves: [chicane(false), raised(2)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  ChicaneX3SlopeRight: () => ({
    curves: [chicane(false), raised(2)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),

  TiltStraight: () => ({
    curves: [straight(), tilt(true)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  TiltSwitchRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), slope(true, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  TiltSwitchLeft: () => ({
    curves: [slope(true, (r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),

  ChicaneX2TiltLeft: () => ({
    curves: [chicane(true), raised(-2), tilt(true)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  ChicaneX3TiltLeft: () => ({
    curves: [chicane(true), raised(-2), tilt(true)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),
  ChicaneX2TiltRight: () => ({
    curves: [chicane(false), raised(2), tilt(true)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  ChicaneX3TiltRight: () => ({
    curves: [chicane(false), raised(2), tilt(true)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),

  TiltCurve1: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  TiltCurve2: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  TiltCurve3: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(3, 1, 3),
    offset: new Vec3(0, -1, 0)
  }),
  TiltCurve4: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(4, 1, 4),
    offset: new Vec3(0, -1, 0)
  }),

  TiltCurve1DownLeft: () => ({
    curves: [curve(), tilt(false, "TopLeftUp")],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  TiltCurve1DownRight: () => ({
    curves: [curve(), tilt(false, "BottomLeftUp")],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  TiltCurve1UpLeft: () => ({
    curves: [curve(), tilt(false, "BottomLeftDown")],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  TiltCurve1UpRight: () => ({
    curves: [curve(), tilt(false, "TopLeftDown")],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),

  TiltCurve2DownLeft: () => ({
    curves: [curve(), tilt(false, "TopLeftUp"), raised(1)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  TiltCurve2DownRight: () => ({
    curves: [curve(), tilt(false, "BottomLeftUp"), raised(1)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  TiltCurve2UpLeft: () => ({
    curves: [curve(), tilt(false, "BottomLeftDown"), raised(2)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  TiltCurve2UpRight: () => ({
    curves: [curve(), tilt(false, "TopLeftDown"), raised(-2)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),

  TiltTransition1UpRight: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(true, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  TiltTransition2UpRight: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(true, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  TiltTransition2UpRightCurveIn: () => ({
    curves: [curve(), tilt(false, "BottomLeftUp")],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),

  TiltTransition1UpLeft: () => ({
    curves: [slope(true, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  TiltTransition2UpLeft: () => ({
    curves: [slope(true, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  TiltTransition2UpLeftCurveIn: () => ({
    curves: [curve(), tilt(false, "TopLeftUp")],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0),
    rotation: new Vec3(0, Math.PI * 0.5, 0)
  }),

  TiltTransition1DownRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5), up(1, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  TiltTransition2DownRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5), up(1, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  TiltTransition2DownRightCurveIn: () => ({
    curves: [curve(), tilt(true, "BottomLeftDown")],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),

  TiltTransition1DownLeft: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5), up(1, (r, t) => (r + 1) * 0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  TiltTransition2DownLeft: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5), up(1, (r, t) => (r + 1) * 0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  TiltTransition2DownLeftCurveIn: () => ({
    curves: [curve(), tilt(true, "TopLeftDown")],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0),
    rotation: new Vec3(0, Math.PI * 0.5, 0)
  }),
}

function getRoadSurface(name: string): Surface {
  const surface = getTrackSurface(name, roadLeft + borderWidth + trackLineWidth, roadRight - borderWidth - trackLineWidth);

  const points = [
    new Vec3(roadLeft, 0, 0),
    new Vec3(roadLeft, borderHeight, 0),
    new Vec3(roadLeft + borderWidth, borderHeight, 0),
    new Vec3(roadLeft + borderWidth, trackHeight, 0),
    new Vec3(roadLeft + borderWidth + trackLineWidth, trackHeight, 0),

    ...surface.points,

    new Vec3(roadRight - borderWidth - trackLineWidth, trackHeight, 0),
    new Vec3(roadRight - borderWidth, trackHeight, 0),
    new Vec3(roadRight - borderWidth, borderHeight, 0),
    new Vec3(roadRight, borderHeight, 0),
    new Vec3(roadRight, 0, 0),
  ];

  const colors = [
    edgeColor,
    borderColor,
    borderColor,
    borderSideColor,
    surface.lineColor,

    ...surface.colors,

    surface.lineColor,
    borderSideColor,
    borderColor,
    borderColor,
    borderColor,
    edgeColor,
    edgeColor,
  ];

  return {...surface, points, colors};
}

export function getRoadCurve(name: string): CurveDescription {
  name = name.replace(/Road(Tech|Dirt|Ice)/, "");

  if (!(name in roads)) return {
    curves: [straight()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  };

  return roads[name]();
}

export function createRoad(name: string): BlockMesh {
  const curve = getRoadCurve(name);
  const surface = getRoadSurface(name);
  return createSurface(name, surface, curve);
}