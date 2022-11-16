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
  RoadTechStraight: () => ({
    curves: [straight()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),

  RoadTechCurve1: () => ({
    curves: [curve()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechCurve2: () => ({
    curves: [curve()],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechCurve3: () => ({
    curves: [curve()],
    size: new Vec3(3, 1, 3),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechCurve4: () => ({
    curves: [curve()],
    size: new Vec3(4, 1, 4),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechCurve5: () => ({
    curves: [curve()],
    size: new Vec3(5, 1, 5),
    offset: new Vec3(0, -1, 0)
  }),

  RoadTechChicaneX2Left: () => ({
    curves: [chicane(true)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechChicaneX3Left: () => ({
    curves: [chicane(true)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),
  RoadTechChicaneX2Right: () => ({
    curves: [chicane(false)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechChicaneX3Right: () => ({
    curves: [chicane(false)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),

  RoadTechSlopeBase2: () => ({
    curves: [slope()],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, -2, 0)
  }),
  RoadTechSlopeBase: () => ({
    curves: [slope()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechSlopeBase2x1: () => ({
    curves: [slope()],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),

  RoadTechSlopeStraight: () => ({
    curves: [straight(), raised(1)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechSlopeStart2x1: () => ({
    curves: [straight(), convex(), raised(2)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  RoadTechSlopeEnd2x1: () => ({
    curves: [straight(), concave(), raised(2)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),

  RoadTechSlopeUTop: () => ({
    curves: [straight(), concave(1)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechSlopeUTopX2: () => ({
    curves: [straight(), concave()],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  RoadTechSlopeUBottom: () => ({
    curves: [straight(), convex(), up(1)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechSlopeUBottomX2: () => ({
    curves: [straight(), convex(), up(1)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  RoadTechSlopeUBottomInGround: () => ({
    curves: [straight(), convex(1)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechSlopeUBottomX2InGround: () => ({
    curves: [straight(), convex(1.25)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),

  RoadTechChicaneX2SlopeLeft: () => ({
    curves: [chicane(true), raised(2)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechChicaneX3SlopeLeft: () => ({
    curves: [chicane(true), raised(2)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),
  RoadTechChicaneX2SlopeRight: () => ({
    curves: [chicane(false), raised(2)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechChicaneX3SlopeRight: () => ({
    curves: [chicane(false), raised(2)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),

  RoadTechTiltStraight: () => ({
    curves: [straight(), tilt(true)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltSwitchRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), slope(true, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltSwitchLeft: () => ({
    curves: [slope(true, (r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),

  RoadTechChicaneX2TiltLeft: () => ({
    curves: [chicane(true), raised(-2), tilt(true)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechChicaneX3TiltLeft: () => ({
    curves: [chicane(true), raised(-2), tilt(true)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),
  RoadTechChicaneX2TiltRight: () => ({
    curves: [chicane(false), raised(2), tilt(true)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechChicaneX3TiltRight: () => ({
    curves: [chicane(false), raised(2), tilt(true)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, -1, -1)
  }),

  RoadTechTiltCurve1: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltCurve2: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltCurve3: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(3, 1, 3),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltCurve4: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(4, 1, 4),
    offset: new Vec3(0, -1, 0)
  }),

  RoadTechTiltCurve1DownLeft: () => ({
    curves: [curve(), tilt(false, "TopLeftUp")],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltCurve1DownRight: () => ({
    curves: [curve(), tilt(false, "BottomLeftUp")],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltCurve1UpLeft: () => ({
    curves: [curve(), tilt(false, "BottomLeftDown")],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltCurve1UpRight: () => ({
    curves: [curve(), tilt(false, "TopLeftDown")],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),

  RoadTechTiltCurve2DownLeft: () => ({
    curves: [curve(), tilt(false, "TopLeftUp"), raised(1)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltCurve2DownRight: () => ({
    curves: [curve(), tilt(false, "BottomLeftUp"), raised(1)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltCurve2UpLeft: () => ({
    curves: [curve(), tilt(false, "BottomLeftDown"), raised(2)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltCurve2UpRight: () => ({
    curves: [curve(), tilt(false, "TopLeftDown"), raised(-2)],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),

  RoadTechTiltTransition1UpRight: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(true, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltTransition2UpRight: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(true, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  RoadTechTiltTransition2UpRightCurveIn: () => ({
    curves: [curve(), tilt(false, "BottomLeftUp")],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),

  RoadTechTiltTransition1UpLeft: () => ({
    curves: [slope(true, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltTransition2UpLeft: () => ({
    curves: [slope(true, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  RoadTechTiltTransition2UpLeftCurveIn: () => ({
    curves: [curve(), tilt(false, "TopLeftUp")],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0),
    rotation: Math.PI * 0.5
  }),

  RoadTechTiltTransition1DownRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5), up(1, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltTransition2DownRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5), up(1, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  RoadTechTiltTransition2DownRightCurveIn: () => ({
    curves: [curve(), tilt(true, "BottomLeftDown")],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0)
  }),

  RoadTechTiltTransition1DownLeft: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5), up(1, (r, t) => (r + 1) * 0.5)],
    size: new Vec3(1, 1, 1),
    offset: new Vec3(0, -1, 0)
  }),
  RoadTechTiltTransition2DownLeft: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5), up(1, (r, t) => (r + 1) * 0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, -1, -1)
  }),
  RoadTechTiltTransition2DownLeftCurveIn: () => ({
    curves: [curve(), tilt(true, "TopLeftDown")],
    size: new Vec3(2, 1, 2),
    offset: new Vec3(0, -1, 0),
    rotation: Math.PI * 0.5
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