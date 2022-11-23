import { Block } from "../parser/nodes";
import { Vec3 } from "../parser/types";
import { BlockMesh } from "./block";
import { Colors } from "./colors";
import { chicane, concave, convex, curve, CurveDescription, flat, raised, slope, straight, tilt, up } from "./curve";
import { createSurface, getTrackSurface, Surface, trackHeight } from "./surface";

const roadLeft = -0.9;
const roadRight = 0.9;
const borderHeight = 0.4;
const borderWidth = 0.125;
const trackLineOffset = 0.1875;
const trackLineWidth = 0.01;

const roads: {[name: string]: () => CurveDescription} = {
  Straight: () => ({
    curves: [straight()],
    size: new Vec3(1, 1, 1)
  }),

  Curve1: () => ({
    curves: [curve()],
    size: new Vec3(1, 1, 1)
  }),
  Curve2: () => ({
    curves: [curve()],
    size: new Vec3(2, 1, 2)
  }),
  Curve3: () => ({
    curves: [curve()],
    size: new Vec3(3, 1, 3)
  }),
  Curve4: () => ({
    curves: [curve()],
    size: new Vec3(4, 1, 4)
  }),
  Curve5: () => ({
    curves: [curve()],
    size: new Vec3(5, 1, 5)
  }),

  ChicaneX2Left: () => ({
    curves: [chicane(true)],
    size: new Vec3(2, 1, 2)
  }),
  ChicaneX3Left: () => ({
    curves: [chicane(true)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, 0, -1)
  }),
  ChicaneX2Right: () => ({
    curves: [chicane(false)],
    size: new Vec3(2, 1, 2)
  }),
  ChicaneX3Right: () => ({
    curves: [chicane(false)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, 0, -1)
  }),

  SlopeBase2: () => ({
    curves: [slope()],
    size: new Vec3(1, 2, 1),
    offset: new Vec3(0, 0, 0)
  }),
  SlopeBase: () => ({
    curves: [slope()],
    size: new Vec3(1, 0, 1)
  }),
  SlopeBase2x1: () => ({
    curves: [slope()],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(0, 0, -1),
    pivot: new Vec3(0, 0, 1)
  }),

  SlopeStraight: () => ({
    curves: [straight(), raised(1)],
    size: new Vec3(1, 1, 1)
  }),
  SlopeStart2x1: () => ({
    curves: [straight(), convex(), raised(2)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, 0, -1)
  }),
  SlopeEnd2x1: () => ({
    curves: [straight(), concave(), raised(2)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, 0, -1)
  }),

  SlopeUTop: () => ({
    curves: [straight(), concave(1)],
    size: new Vec3(1, 1, 1)
  }),
  SlopeUTopX2: () => ({
    curves: [straight(), concave()],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, 0, -1)
  }),
  SlopeUBottom: () => ({
    curves: [straight(), convex(), up(1)],
    size: new Vec3(1, 1, 1)
  }),
  SlopeUBottomX2: () => ({
    curves: [straight(), convex(), up(1)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, 0, -1)
  }),
  SlopeUBottomInGround: () => ({
    curves: [straight(), convex(1)],
    size: new Vec3(1, 1, 1)
  }),
  SlopeUBottomX2InGround: () => ({
    curves: [straight(), convex(1.25)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, 0, -1)
  }),

  ChicaneX2SlopeLeft: () => ({
    curves: [chicane(true), raised(2)],
    size: new Vec3(2, 1, 2)
  }),
  ChicaneX3SlopeLeft: () => ({
    curves: [chicane(true), raised(2)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, 0, -1)
  }),
  ChicaneX2SlopeRight: () => ({
    curves: [chicane(false), raised(2)],
    size: new Vec3(2, 1, 2)
  }),
  ChicaneX3SlopeRight: () => ({
    curves: [chicane(false), raised(2)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, 0, -1)
  }),

  TiltStraight: () => ({
    curves: [straight(), tilt(true)],
    size: new Vec3(1, 1, 1)
  }),
  TiltSwitchRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), slope(true, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1)
  }),
  TiltSwitchLeft: () => ({
    curves: [slope(true, (r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1)
  }),

  ChicaneX2TiltLeft: () => ({
    curves: [chicane(true), raised(-2), tilt(true)],
    size: new Vec3(2, 1, 2)
  }),
  ChicaneX3TiltLeft: () => ({
    curves: [chicane(true), raised(-2), tilt(true)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, 0, -1)
  }),
  ChicaneX2TiltRight: () => ({
    curves: [chicane(false), raised(2), tilt(true)],
    size: new Vec3(2, 1, 2)
  }),
  ChicaneX3TiltRight: () => ({
    curves: [chicane(false), raised(2), tilt(true)],
    size: new Vec3(2, 1, 3),
    offset: new Vec3(1, 0, -1)
  }),

  TiltCurve1: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(1, 1, 1)
  }),
  TiltCurve2: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(2, 1, 2)
  }),
  TiltCurve3: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(3, 1, 3)
  }),
  TiltCurve4: () => ({
    curves: [curve(), tilt()],
    size: new Vec3(4, 1, 4)
  }),

  TiltCurve1DownLeft: () => ({
    curves: [curve(), tilt(false, "TopLeftUp")],
    size: new Vec3(1, 1, 1)
  }),
  TiltCurve1DownRight: () => ({
    curves: [curve(), tilt(false, "BottomLeftUp")],
    size: new Vec3(1, 1, 1)
  }),
  TiltCurve1UpLeft: () => ({
    curves: [curve(), tilt(false, "BottomLeftDown")],
    size: new Vec3(1, 1, 1)
  }),
  TiltCurve1UpRight: () => ({
    curves: [curve(), tilt(false, "TopLeftDown")],
    size: new Vec3(1, 1, 1)
  }),

  TiltCurve2DownLeft: () => ({
    curves: [curve(), tilt(false, "TopLeftUp"), raised(1)],
    size: new Vec3(2, 1, 2)
  }),
  TiltCurve2DownRight: () => ({
    curves: [curve(), tilt(false, "BottomLeftUp"), raised(1)],
    size: new Vec3(2, 1, 2)
  }),
  TiltCurve2UpLeft: () => ({
    curves: [curve(), tilt(false, "BottomLeftDown"), raised(2)],
    size: new Vec3(2, 1, 2)
  }),
  TiltCurve2UpRight: () => ({
    curves: [curve(), tilt(false, "TopLeftDown"), raised(-2)],
    size: new Vec3(2, 1, 2)
  }),

  TiltTransition1UpRight: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(true, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1)
  }),
  TiltTransition2UpRight: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(true, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, 0, -1)
  }),
  TiltTransition2UpRightCurveIn: () => ({
    curves: [curve(), tilt(false, "BottomLeftUp")],
    size: new Vec3(2, 1, 2)
  }),

  TiltTransition1UpLeft: () => ({
    curves: [slope(true, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1)
  }),
  TiltTransition2UpLeft: () => ({
    curves: [slope(true, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, 0, -1)
  }),
  TiltTransition2UpLeftCurveIn: () => ({
    curves: [curve(), tilt(false, "TopLeftUp")],
    size: new Vec3(2, 1, 2),
    rotation: new Vec3(0, Math.PI * 0.5, 0)
  }),

  TiltTransition1DownRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5), up(1, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 1)
  }),
  TiltTransition2DownRight: () => ({
    curves: [slope(false, (r, t) => (r + 1) * 0.5), flat((r, t) => (r - 1) * -0.5), up(1, (r, t) => (r - 1) * -0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, 0, -1)
  }),
  TiltTransition2DownRightCurveIn: () => ({
    curves: [curve(), tilt(true, "BottomLeftDown")],
    size: new Vec3(2, 1, 2)
  }),

  TiltTransition1DownLeft: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5), up(1, (r, t) => (r + 1) * 0.5)],
    size: new Vec3(1, 1, 1)
  }),
  TiltTransition2DownLeft: () => ({
    curves: [flat((r, t) => (r + 1) * 0.5), slope(false, (r, t) => (r - 1) * -0.5), up(1, (r, t) => (r + 1) * 0.5)],
    size: new Vec3(1, 1, 2),
    offset: new Vec3(1, 0, -1)
  }),
  TiltTransition2DownLeftCurveIn: () => ({
    curves: [curve(), tilt(true, "TopLeftDown")],
    size: new Vec3(2, 1, 2),
    rotation: new Vec3(0, Math.PI * 0.5, 0)
  }),
}

function getRoadSurface(block: Block): Surface {
  const surface = getTrackSurface(
    block.blockName, 
    roadLeft + borderWidth + trackLineOffset + trackLineWidth, 
    roadRight - borderWidth - trackLineOffset - trackLineWidth,
    block.color,
    'road'
  );

  const points = [
    new Vec3(roadLeft, 0, 0),
    new Vec3(roadLeft, borderHeight, 0),
    new Vec3(roadLeft + borderWidth, borderHeight, 0),
    new Vec3(roadLeft + borderWidth, trackHeight, 0),
    new Vec3(roadLeft + borderWidth + trackLineOffset, 0.178, 0),
    new Vec3(roadLeft + borderWidth + trackLineOffset + trackLineWidth, 0.17, 0),

    ...surface.points,

    new Vec3(roadRight - borderWidth - trackLineOffset - trackLineWidth, 0.17, 0),
    new Vec3(roadRight - borderWidth - trackLineOffset,  0.178, 0),
    new Vec3(roadRight - borderWidth, trackHeight, 0),
    new Vec3(roadRight - borderWidth, borderHeight, 0),
    new Vec3(roadRight, borderHeight, 0),
    new Vec3(roadRight, 0, 0),
  ];

  const colors = [
    Colors.edgeColor,
    Colors.borderColor,
    Colors.borderColor,
    Colors.borderSideColor,
    surface.lineColor,
    Colors.trackLine,

    ...surface.colors,

    Colors.trackLine,
    surface.lineColor,
    Colors.borderSideColor,
    Colors.borderColor,
    Colors.borderColor,
    Colors.borderColor,
    Colors.edgeColor,
    Colors.edgeColor,
  ];

  return {...surface, points, colors};
}

export function getRoadCurve(name: string): CurveDescription {
  name = name.replace(/Road(Tech|Dirt|Ice)/, "");

  if (!(name in roads)) return {
    curves: [straight()],
    size: new Vec3(1, 1, 1)
  };

  return roads[name]();
}

export function createRoad(block: Block): BlockMesh {
  const curve = getRoadCurve(block.blockName);
  const surface = getRoadSurface(block);
  return createSurface(block.blockName, surface, curve);
}