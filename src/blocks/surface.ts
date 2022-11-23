import { Bezier } from "bezier-js";
import { DifficultyColor } from "../parser/classes/CGameCtnChallenge";
import { Vec3, Color } from "../parser/types";
import { bezierAtX } from "../utils/bezier";
import { BlockMesh } from "./block";
import { Colors } from "./colors";
import { CurveDescription } from "./curve";
import { MeshOutput, shape, createMesh } from "./mesh";

export interface Surface {
  points: Vec3[];
  colors: Color[];
  color: Color;
  lineColor: Color;
}

export const trackHeight = 0.25;
const trackHeightDirt = 0.05;

const bumpWidthLeft = 0.09375;
const bumpWidthMiddle = 0.125;
const bumpHeightLine = trackHeight + 0.075;
const bumpHeightLeft = trackHeight + 0.14;
const bumpHeightMiddle = trackHeight + 0.2;
const bumpHeightTop = trackHeight + 0.25;

export function getMiddlePoints(left: number, right: number, height: number | ((x: number) => number), stepSize: number = 0.1) {
  const points: Vec3[] = [];

  if (left < right) {
    for (let i = left; i < right; i += stepSize) {
      points.push(new Vec3(i, typeof height === 'function' ? height((i - left) / (right - left)) : height, 0));
    }
  }

  if (left > right) {
    for (let i = left; i > right; i -= stepSize) {
      points.push(new Vec3(i, typeof height === 'function' ? height((i - left) / (right - left)) : height, 0));
    }
  }

  points.push(new Vec3(right, typeof height === 'function' ? height(1) : height, 0));

  return points;
}

export function getMiddlePointCount(left: number, right: number, stepSize: number = 0.1) {
  let count = 0;
  
  if (left < right) {
    for (let i = left; i < right; i += stepSize) count++;
  }

  if (left > right) {
    for (let i = left; i > right; i -= stepSize) count++;
  }

  return count + 1;
}

export function getDifficultyColor(difficulty: DifficultyColor, colors: {[key: string]: Color}) {
  if (difficulty === DifficultyColor.White) return colors.white;
  if (difficulty === DifficultyColor.Green) return colors.green;
  if (difficulty === DifficultyColor.Blue) return colors.blue;
  if (difficulty === DifficultyColor.Red) return colors.red;
  if (difficulty === DifficultyColor.Black) return colors.black;
  return colors.default;
}

export function getTrackSurface(
  name: string, 
  left: number, 
  right: number, 
  difficulty?: DifficultyColor,
  type: 'road' | 'platform' = 'road'
): Surface {
  const difficultyColor = difficulty && getDifficultyColor(difficulty, Colors.difficulty);

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
      Colors.bumpColorLeft,
      Colors.bumpColorMiddle,

      Colors.bumpColorTop,
      Colors.bumpColorTop,

      Colors.bumpColorMiddle,
      Colors.bumpColorLeft,
    ],
    color: Colors.bumpColorTop,
    lineColor: difficultyColor || Colors.bumpBorderColor
  };
  
  let color, lineColor;
  let height: number | ((x: number) => number) = trackHeight;

  if (name.includes("Dirt")) {
    color = Colors.dirtColor;
    lineColor = difficultyColor || Colors.dirtColor;

    if (type === 'road') {
      const bezier = new Bezier(
        0, 0.17, 
        0.15, trackHeightDirt,
        0.85, trackHeightDirt,
        1, 0.17,
      );
      height = (x: number) => bezierAtX(bezier, x) || 0.17;
    }
  } else if (name.includes("Water")) {
    color = Colors.waterColor;
    lineColor = difficultyColor || Colors.waterColor;
  } else if (name.includes("Grass")) {
    color = Colors.grassColor;
    lineColor = difficultyColor || Colors.grassColor;
  } else if (name.includes("Plastic")) {
    color = difficulty ? getDifficultyColor(difficulty, Colors.plastic) : Colors.plastic.default;
    lineColor = difficultyColor || Colors.trackLine;
  } else if (name.includes("Ice")) {
    color = Colors.iceColor;
    lineColor = difficultyColor || Colors.iceColor;
  } else if (name.includes("Tech")) {
    color = Colors.techColor;
    lineColor = difficultyColor || Colors.difficulty.green;
  } else if (name.includes("Platform")) {
    color = Colors.platformColor;
    lineColor = difficultyColor || Colors.platformColor;
  } else {
    throw new Error("Unknown track type: " + name);
  }

  return { 
    points: getMiddlePoints(left, right, height),
    colors: new Array(getMiddlePointCount(left, right) + 1).fill(color),
    color: color,
    lineColor: lineColor
  };
}

export function createSurface(name: string, surface: Surface, result: CurveDescription): BlockMesh {
  const out: MeshOutput = {
    vertices: [],
    colors: [],
  };

  let f = (point: Vec3, step: number) =>
    point.sub(new Vec3(0, 0, 16)).add(new Vec3(0, 0, 32).mul(step));

  const numSteps = 20;

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
    rotation: result.rotation || Vec3.zero(),
    pivot: result.pivot ? new Vec3(result.pivot.x * 16, result.pivot.y * 8, result.pivot.z * 16) : Vec3.zero()
  };

  return blockMesh;
}