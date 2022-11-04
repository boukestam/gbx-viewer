import earcut from "earcut";
import * as THREE from "three";
import { Vec3, Color } from "./parser/types";
import { Bezier } from "bezier-js";

interface Output {
  vertices: number[];
  colors: number[];
}

interface BlockMesh {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>;
  offset: Vec3;
}

const cache: {[name: string]: BlockMesh} = {};

function triangle(a: Vec3, b: Vec3, c: Vec3, color: Color, out: Output) {
  out.vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  out.colors.push(
    color.r,
    color.g,
    color.b,
    color.r,
    color.g,
    color.b,
    color.r,
    color.g,
    color.b
  );
}

function shape(
  points: Vec3[],
  colors: Color[],
  f: (point: Vec3, step: number) => Vec3,
  steps: number,
  out: Output
) {
  const coords = [];
  for (const point of points) coords.push(point.x, point.y);
  const triangles = earcut(coords);

  for (let i = 0; i < triangles.length; i += 3) {
    triangle(
      f(points[triangles[i + 2]], 0),
      f(points[triangles[i + 1]], 0),
      f(points[triangles[i]], 0),
      colors[0],
      out
    );
  }

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < points.length; j++) {
      const next = (j + 1) % points.length;
      triangle(
        f(points[j], i + 1),
        f(points[next], i + 1),
        f(points[j], i),
        colors[j + 1],
        out
      );
      triangle(
        f(points[next], i + 1),
        f(points[next], i),
        f(points[j], i),
        colors[j + 1],
        out
      );
    }
  }

  for (let i = 0; i < triangles.length; i += 3) {
    triangle(
      f(points[triangles[i]], steps),
      f(points[triangles[i + 1]], steps),
      f(points[triangles[i + 2]], steps),
      colors[steps - 1],
      out
    );
  }
}

function createMesh(out: Output) {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(out.vertices), 3)
  );
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(out.colors), 3)
  );
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({
      vertexColors: true,
      shadowSide: THREE.FrontSide
    })
  );

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh;
}

export function createCube(size: Vec3, color: Color) {
  const points = [
    new Vec3(-size.x * 0.5, -size.y * 0.5, 0),
    new Vec3(-size.x * 0.5, size.y * 0.5, 0),
    new Vec3(size.x * 0.5, size.y * 0.5, 0),
    new Vec3(size.x * 0.5, -size.y * 0.5, 0),
  ];

  const colors = [color, color, color, color, color, color];

  const out: Output = {
    vertices: [],
    colors: [],
  };

  shape(
    points,
    colors,
    (point, step) => point.add(new Vec3(0, 0, size.z).mul(step)),
    1,
    out
  );

  return createMesh(out);
}

function linearToSrgb(x: number): number {
  if (x <= 0)
    return 0;
  else if (x >= 1)
    return 1;
  else if (x < 0.0031308)
    return x * 12.92;
  else
    return Math.pow(x, 1 / 2.4) * 1.055 - 0.055;
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : {r: 0, g: 0, b: 0};
}

export function hexToSrgb(hex: string): Color {
  const {r, g, b} = hexToRgb(hex);

  return new Color(
    Math.max((r / 255) - 0.2, 0),
    Math.max((g / 255) - 0.2, 0),
    Math.max((b / 255) - 0.2, 0)
  );
}

const left = -16;
const right = 16;
const borderHeight = 3.2;
const borderWidth = 2;

const trackLineHeight = 2;
const trackLineWidth = 3;

const trackHeight = 0.2;
const trackHeightTech = trackLineHeight;

const bumpWidthLeft = 1.5;
const bumpWidthMiddle = 2;
const bumpHeightLine = trackLineHeight + 0.6;
const bumpHeightLeft = trackLineHeight + 1.1;
const bumpHeightMiddle = trackLineHeight + 1.6;
const bumpHeightTop = trackLineHeight + 2;

const borderColor = hexToSrgb('#ffffff');
const borderSideColor = hexToSrgb('#000000');

const trackLine = hexToSrgb('#ffffff');

const edgeColor = hexToSrgb('#1D2633');
const dirtColor = hexToSrgb('#D07B5D');

const techColor = hexToSrgb('#B2ACAF');
const techBorderColor = hexToSrgb('#437E5A');

const grassColor = hexToSrgb('#6A8642');
const waterColor = hexToSrgb('#8EE4F2');

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

function getTrackCurve(name: string) {
  if (name.includes("Curve")) {
    const amount = parseInt(name[name.length - 1]);

    const size = amount * 16;
    const bezier = new Bezier(
      -size + 16, -size, 
      -size + 16, size - 16, 
      size, size - 16
    );

    return {bezier, axis: new Vec3(1, 0, 2), offset: new Vec3(amount, 0, amount)};
  }

  if (name.includes("Chicane")) {
    const amountIndex = name.indexOf("X") + 1;
    const amount = parseInt(name[amountIndex]);

    const direction = name.substring(amountIndex + 1);
    const mul = direction === 'Left' ? -1 : 1;

    const height = amount * 16;
    const bezier = new Bezier(
      -16, height * mul, 
      -16, -8 * mul,
      16, 8 * mul,
      16, -height * mul,
    );

    return {bezier, axis: new Vec3(1, 0, 2), offset: new Vec3(amount, 0, 2)};
  }

  if (name.includes("Slope")) {
    const amount0Index = name.indexOf("Base") + 4;
    const amount1Index = name.indexOf("x") + 1;

    let heightAmount, lengthAmount;

    if (amount1Index === 0) {
      lengthAmount = 1;
      heightAmount = parseInt(name[amount0Index]);
    } else {
      lengthAmount = parseInt(name[amount0Index])
      heightAmount = parseInt(name[amount1Index]);
    }

    const length = lengthAmount * 16;
    const height = heightAmount * 4;
    const bezier = new Bezier(
      -length, -height, 
      -4, -height,
      4, height,
      length, height,
    );

    return {bezier, axis: new Vec3(0, 4, 3), offset: new Vec3(lengthAmount, heightAmount, 1)};
  }
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

  const out: Output = {
    vertices: [],
    colors: [],
  };

  let f = (point: Vec3, step: number) =>
    point.sub(new Vec3(0, 0, 16)).add(new Vec3(0, 0, 32).mul(step));
  let numSteps = 1;
  let worldOffset = new Vec3(16, 0, 16);

  const curve = getTrackCurve(name);

  if (curve) {
    worldOffset = new Vec3(32 - curve.offset.x * 16, -curve.offset.y * 4, 32 - curve.offset.z * 16);
    numSteps = 10;

    f = (point: Vec3, step: number) => {
      const t = step / numSteps;
      const pt = curve.bezier.get(t);
      const nv = curve.bezier.normal(t);

      const a1 = pt.x + point.x * -nv.x;
      const a2 = pt.y + point.x * -nv.y;
      const a3 = pt.x + point.y * nv.x;
      const a4 = -pt.y + point.y * nv.y;

      const getF = (axis: number, point: number) => {
        if (axis === 1) return a1;
        if (axis === 2) return a2;
        if (axis === 3) return a3;
        if (axis === 4) return a4;
        return point;
      } 

      return new Vec3(
        getF(curve.axis.x, point.x), 
        getF(curve.axis.y, point.y),
        getF(curve.axis.z, point.z)
      );
    };
  }

  shape(points, colors, f, numSteps, out);

  const blockMesh = {
    mesh: createMesh(out),
    offset: worldOffset,
  };

  cache[name] = blockMesh;

  return blockMesh;
}
