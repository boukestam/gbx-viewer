import { Vec3, Color } from "../parser/types";
import { hexToSrgb } from "../utils/color";
import { BlockMesh } from "./block";
import { getTrackCurve } from "./curve";
import { shape, createMesh, MeshOutput } from "./mesh";

const cache: {[name: string]: BlockMesh} = {};

const left = -0.9;
const right = 0.9;
const borderHeight = 0.4;
const borderWidth = 0.125;

const trackLineHeight = 0.25;
const trackLineWidth = 0.1875;

const trackHeight = 0.025;
const trackHeightTech = trackLineHeight;

const bumpWidthLeft = 0.09375;
const bumpWidthMiddle = 0.125;
const bumpHeightLine = trackLineHeight + 0.075;
const bumpHeightLeft = trackLineHeight + 0.14;
const bumpHeightMiddle = trackLineHeight + 0.2;
const bumpHeightTop = trackLineHeight + 0.25;

const borderColor = hexToSrgb('#ffffff');
const borderSideColor = hexToSrgb('#000000');

const trackLine = hexToSrgb('#ffffff');

const edgeColor = hexToSrgb('#1D2633');
const dirtColor = hexToSrgb('#D07B5D');

const techColor = hexToSrgb('#B2ACAF');
const techBorderColor = hexToSrgb('#437E5A');

const grassColor = hexToSrgb('#6A8642');
const waterColor = hexToSrgb('#8EE4F2');
const iceColor = hexToSrgb('#ffffff');

const bumpColorTop = hexToSrgb('#C5BBB4');
const bumpColorMiddle = hexToSrgb('#5D585B');
const bumpColorLeft = hexToSrgb('#3E3D3B');
const bumpBorderColor = hexToSrgb('#B32022');

export function getTrackSurface(name: string): {points: Vec3[]; colors: Color[]} {
  if (name.includes("Dirt")) return { 
    points: [
      new Vec3(left + borderWidth + trackLineWidth, trackHeight, 0),
      new Vec3(right - borderWidth - trackLineWidth, trackHeight, 0),
    ],
    colors: [
      trackLine,
      dirtColor,
      trackLine,
    ]
  };

  if (name.includes("Water")) return { 
    points: [
      new Vec3(left + borderWidth + trackLineWidth, trackHeight, 0),
      new Vec3(right - borderWidth - trackLineWidth, trackHeight, 0),
    ],
    colors: [
      trackLine,
      waterColor,
      trackLine,
    ]
  };

  if (name.includes("Grass")) return { 
    points: [
      new Vec3(left + borderWidth + trackLineWidth, trackHeight, 0),
      new Vec3(right - borderWidth - trackLineWidth, trackHeight, 0),
    ],
    colors: [
      trackLine,
      grassColor,
      trackLine,
    ]
  };

  if (name.includes("Ice")) return { 
    points: [
      new Vec3(left + borderWidth + trackLineWidth, trackHeight, 0),
      new Vec3(right - borderWidth - trackLineWidth, trackHeight, 0),
    ],
    colors: [
      trackLine,
      iceColor,
      trackLine,
    ]
  };

  if (name.includes("Tech")) return { 
    points: [
      new Vec3(left + borderWidth + trackLineWidth, trackHeightTech, 0),
      new Vec3(right - borderWidth - trackLineWidth, trackHeightTech, 0),
    ],
    colors: [
      techBorderColor,
      techColor,
      techBorderColor,
    ]
  };

  if (name.includes("Bump")) return { 
    points: [
      new Vec3(left + borderWidth + trackLineWidth, bumpHeightLine, 0),
      new Vec3(left + borderWidth + trackLineWidth + bumpWidthLeft, bumpHeightLeft, 0),
      new Vec3(left + borderWidth + trackLineWidth + bumpWidthLeft + bumpWidthMiddle, bumpHeightMiddle, 0),
      
      new Vec3(0, bumpHeightTop, 0),

      new Vec3(right - borderWidth - trackLineWidth - bumpWidthLeft - bumpWidthMiddle, bumpHeightMiddle, 0),
      new Vec3(right - borderWidth - trackLineWidth - bumpWidthLeft, bumpHeightLeft, 0),
      new Vec3(right - borderWidth - trackLineWidth, bumpHeightLine, 0),
    ],
    colors: [
      bumpBorderColor,
      bumpColorLeft,
      bumpColorMiddle,

      bumpColorTop,
      bumpColorTop,

      bumpColorMiddle,
      bumpColorLeft,
      bumpBorderColor,
    ]
  };

  throw new Error("Unknown track type: " + name);
}

export function createRoad(name: string): BlockMesh {
  if (name in cache) return cache[name];

  const surface = getTrackSurface(name);

  const points = [
    new Vec3(left, 0, 0),
    new Vec3(left, borderHeight, 0),
    new Vec3(left + borderWidth, borderHeight, 0),
    new Vec3(left + borderWidth, trackLineHeight, 0),

    ...surface.points,

    new Vec3(right - borderWidth, trackLineHeight, 0),
    new Vec3(right - borderWidth, borderHeight, 0),
    new Vec3(right, borderHeight, 0),
    new Vec3(right, 0, 0),
  ];

  const colors = [
    edgeColor,
    borderColor,
    borderColor,
    borderSideColor,

    ...surface.colors,

    borderSideColor,
    borderColor,
    borderColor,
    borderColor,
    edgeColor,
  ];

  const out: MeshOutput = {
    vertices: [],
    colors: [],
  };

  let f = (point: Vec3, step: number) =>
    point.sub(new Vec3(0, 0, 16)).add(new Vec3(0, 0, 32).mul(step));

  const result = getTrackCurve(name);

  const numSteps = 20;
  const pos = result.size.add(result.offset);
  const worldOffset = new Vec3(32 - pos.x * 16, -pos.y * 4, 32 - pos.z * 16);

  f = (point: Vec3, step: number) => {
    const t = step / numSteps;

    const getF = (a: 'x' | 'y' | 'z') => {
      let sum = 0;
      let found = false;

      for (const curve of result.curves) {
        if (curve.axis[a] === 0) continue;

        let x = curve.right ? (point.x + 1) : point.x;

        if (curve.bezier) {
          const pt = curve.bezier.get(t);
          const nv = curve.bezier.normal(t);

          if (curve.axis[a] === 1) return pt.x * result.size[a] + x * -nv.x;
          if (curve.axis[a] === 2) return pt.y * result.size[a] + x * -nv.y;
          if (curve.axis[a] === 3) return pt.x * result.size[a] + point.y * nv.x;
          if (curve.axis[a] === 4) return pt.y * result.size[a] + point.y * nv.y;
        }

        if (curve.f) {
          if (curve.axis[a] === 1) sum += point.y + curve.f(x, t);
        }

        found = true;
      }

      if (!found) return point[a] * result.size[a];

      return sum;
    };

    return new Vec3(
      getF('x') * 16, 
      getF('y') * 8,
      getF('z') * 16
    );
  };

  shape(points, colors, f, numSteps, out);

  const blockMesh = {
    mesh: createMesh(out),
    offset: worldOffset,
    rotation: result.rotation
  };

  cache[name] = blockMesh;

  return blockMesh;
}