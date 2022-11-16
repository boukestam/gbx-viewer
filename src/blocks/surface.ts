import { Vec3, Color } from "../parser/types";
import { hexToSrgb } from "../utils/color";
import { BlockMesh } from "./block";
import { CurveDescription } from "./curve";
import { MeshOutput, shape, createMesh } from "./mesh";

export interface Surface {
  points: Vec3[];
  colors: Color[];
  color: Color;
  lineColor: Color;
}

const cache: {[name: string]: BlockMesh} = {};

export const trackHeight = 0.25;
const trackHeightDirt = 0.025;

const bumpWidthLeft = 0.09375;
const bumpWidthMiddle = 0.125;
const bumpHeightLine = trackHeight + 0.075;
const bumpHeightLeft = trackHeight + 0.14;
const bumpHeightMiddle = trackHeight + 0.2;
const bumpHeightTop = trackHeight + 0.25;

const trackLine = hexToSrgb('#ffffff');

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

export function getMiddlePoints(left: number, right: number, height: number, stepSize: number = 0.2) {
  const points: Vec3[] = [];

  if (left < right) {
    for (let i = left; i < right; i += stepSize) points.push(new Vec3(i, height, 0));
  }

  if (left > right) {
    for (let i = left; i > right; i -= stepSize) points.push(new Vec3(i, height, 0));
  }

  points.push(new Vec3(right, height, 0));

  return points;
}

export function getMiddlePointCount(left: number, right: number, height: number, stepSize: number = 0.2) {
  let count = 0;
  
  if (left < right) {
    for (let i = left; i < right; i += stepSize) count++;
  }

  if (left > right) {
    for (let i = left; i > right; i -= stepSize) count++;
  }

  return count + 1;
}

export function getTrackSurface(name: string, left: number, right: number): Surface {
  if (name.includes("Dirt")) return { 
    points: getMiddlePoints(left, right, trackHeightDirt),
    colors: new Array(getMiddlePointCount(left, right, trackHeightDirt)).fill(dirtColor),
    color: dirtColor,
    lineColor: trackLine
  };

  if (name.includes("Water")) return { 
    points: getMiddlePoints(left, right, trackHeight),
    colors: new Array(getMiddlePointCount(left, right, trackHeight)).fill(waterColor),
    color: waterColor,
    lineColor: trackLine
  };

  if (name.includes("Grass")) return { 
    points: getMiddlePoints(left, right, trackHeight),
    colors: new Array(getMiddlePointCount(left, right, trackHeight)).fill(grassColor),
    color: grassColor,
    lineColor: trackLine
  };

  if (name.includes("Ice")) return { 
    points: getMiddlePoints(left, right, trackHeight),
    colors: new Array(getMiddlePointCount(left, right, trackHeight)).fill(iceColor),
    color: iceColor,
    lineColor: trackLine
  };

  if (name.includes("Tech")) return { 
    points: getMiddlePoints(left, right, trackHeight),
    colors: new Array(getMiddlePointCount(left, right, trackHeight) - 1).fill(techColor),
    color: techColor,
    lineColor: techBorderColor
  };

  if (name.includes("Bump")) return { 
    points: [
      new Vec3(left, bumpHeightLine, 0),
      new Vec3(left + bumpWidthLeft, bumpHeightLeft, 0),
      new Vec3(left + bumpWidthLeft + bumpWidthMiddle, bumpHeightMiddle, 0),
      
      new Vec3(0, bumpHeightTop, 0),

      new Vec3(right - bumpWidthLeft - bumpWidthMiddle, bumpHeightMiddle, 0),
      new Vec3(right - bumpWidthLeft, bumpHeightLeft, 0),
      new Vec3(right, bumpHeightLine, 0),
    ],
    colors: [
      bumpColorLeft,
      bumpColorMiddle,

      bumpColorTop,
      bumpColorTop,

      bumpColorMiddle,
      bumpColorLeft,
    ],
    color: bumpColorTop,
    lineColor: bumpBorderColor
  };

  throw new Error("Unknown track type: " + name);
}

export function createSurface(name: string, surface: Surface, result: CurveDescription): BlockMesh {
  if (name in cache) return cache[name];

  const out: MeshOutput = {
    vertices: [],
    colors: [],
  };

  let f = (point: Vec3, step: number) =>
    point.sub(new Vec3(0, 0, 16)).add(new Vec3(0, 0, 32).mul(step));

  const numSteps = 20;
  const pos = result.size.add(result.offset);
  const worldOffset = new Vec3(32 - pos.x * 16, -pos.y * 4, 32 - pos.z * 16);

  f = (point: Vec3, step: number) => {
    const t = step / numSteps;

    const getF = (a: 'x' | 'y' | 'z') => {
      let sum = 0;
      let count = 0;
      let found = false;

      for (const curve of result.curves) {
        if (curve.axis[a] === 0) continue;

        let x = curve.right ? (point.x + 1) : point.x;

        let ratio;
        if (curve.ratio) {
          ratio = curve.ratio(x, t);
        } else {
          ratio = 1;
          count++;
        }

        if (curve.bezier) {
          const p = curve.xAsStep ? (point.x + 1) * 0.5 : t;

          const pt = curve.bezier.get(p);
          const nv = curve.bezier.normal(p);

          if (curve.axis[a] === 1) sum += (pt.x * result.size[a] + x * -nv.x) * ratio;
          if (curve.axis[a] === 2) sum += (pt.y * result.size[a] + x * -nv.y) * ratio;
          if (curve.axis[a] === 3) sum += (pt.x * result.size[a] + point.y * nv.x) * ratio;
          if (curve.axis[a] === 4) sum += (pt.y * result.size[a] + point.y * nv.y) * ratio;
          if (curve.axis[a] === 5) sum += (point[a] + pt.x * result.size[a]) * ratio;
          if (curve.axis[a] === 6) sum += (point[a] + pt.y * result.size[a]) * ratio;
        }

        if (curve.f) {
          if (curve.axis[a] === 1) sum += (point[a] + curve.f(x, t) * result.size[a]) * ratio;
        }

        found = true;
      }

      if (!found) return point[a] * result.size[a];

      return count > 0 ? sum / count : sum;
    };

    return new Vec3(
      Math.max(-result.size.x, Math.min(result.size.x, getF('x'))) * 16, 
      getF('y') * 8,
      Math.max(-result.size.z, Math.min(result.size.z, getF('z'))) * 16
    );
  };

  shape(surface.points, surface.colors, f, numSteps, out);

  const blockMesh = {
    mesh: createMesh(out),
    offset: worldOffset,
    rotation: result.rotation || 0
  };

  cache[name] = blockMesh;

  return blockMesh;
}