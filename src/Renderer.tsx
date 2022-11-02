import React, { createRef, useEffect } from "react";
import { Environment } from "./parser/nodes";

import * as THREE from "three";
import { OrbitControls } from "./orbit";
import { Vec3, Transform, Color } from "./parser/types";
import { GhostSamples } from "./App";

import earcut from "earcut";

interface Output {
  vertices: number[];
  colors: number[];
}

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
      f(points[triangles[i]], 0),
      f(points[triangles[i + 1]], 0),
      f(points[triangles[i + 2]], 0),
      colors[0],
      out
    );
  }

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < points.length; j++) {
      const next = (j + 1) % points.length;
      triangle(
        f(points[j], i),
        f(points[next], i + 1),
        f(points[j], i + 1),
        colors[j + 1],
        out
      );
      triangle(
        f(points[j], i),
        f(points[next], i),
        f(points[next], i + 1),
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

  return new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    })
  );
}

function createCube(size: Vec3, color: Color) {
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

function createRoad(name: string) {
  const left = -16;
  const right = 16;
  const borderHeight = 1.6;
  const borderWidth = 1.8;
  const trackHeight = 0.8;

  const points = [
    new Vec3(left, 0, 0),
    new Vec3(left, borderHeight, 0),
    new Vec3(left + borderWidth, borderHeight, 0),
    new Vec3(left + borderWidth, trackHeight, 0),

    new Vec3(right - borderWidth, trackHeight, 0),
    new Vec3(right - borderWidth, borderHeight, 0),
    new Vec3(right, borderHeight, 0),
    new Vec3(right, 0, 0),
  ];

  const borderColor = { r: 1, g: 1, b: 1 };
  const borderSideColor = { r: 0, g: 0, b: 0 };
  const trackColor = { r: 226 / 255, g: 98 / 255, b: 52 / 255 };
  const edgeColor = { r: 0.2, g: 0.2, b: 0.2 };

  const colors = [
    edgeColor,
    borderColor,
    borderColor,
    borderSideColor,
    trackColor,
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
    point.add(new Vec3(0, 0, 32).mul(step));
  let numSteps = 1;

  if (name.includes("Curve")) {
    const amount = parseInt(name[name.length - 1]);
    const offset = new THREE.Vector3(amount * 16, 0, amount * 16);
    const axis = new THREE.Vector3(0, 1, 0);
    numSteps = 10;

    f = (point: Vec3, step: number) => {
      const rotated = point
        .toTHREE()
        .sub(offset)
        .applyAxisAngle(axis, step * (Math.PI / 2 / numSteps));
      //.add(offset);
      return new Vec3(rotated.x, rotated.y, rotated.z);
    };
  }

  shape(points, colors, f, numSteps, out);

  return createMesh(out);
}

export function Renderer({
  map,
  ghost,
}: {
  map: Environment;
  ghost: GhostSamples;
}) {
  const canvasRef = createRef<HTMLCanvasElement>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 1500;
    camera.position.x = 600;
    camera.position.y = 600;

    // const controls = new OrbitControls(camera, renderer.domElement);

    const scene = new THREE.Scene();

    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(-1, 2, 4);
    scene.add(sun);

    const sky = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(sky);

    for (const block of map.blocks) {
      if (!block.blockName.includes("Road")) continue;

      const blockMesh = createRoad(block.blockName);

      blockMesh.position.set(
        block.x * 32 - 16,
        block.y * 8 - 64,
        block.z * 32 - 16
      );
      blockMesh.rotateY(block.rotation * (Math.PI / 2));

      scene.add(blockMesh);
    }

    function resizeRendererToDisplaySize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }

    console.log(
      map.blocks
        .filter((block) => block.blockName.includes("Road"))
        .map((block) => block.blockName)
    );

    const carMesh = createCube(new Vec3(2.1, 1, 3.7), { r: 0, g: 0, b: 1 });
    scene.add(carMesh);

    let startTime = -1;

    function render(time: number) {
      if (startTime === -1) {
        startTime = time;
      } else {
        time -= startTime;
      }

      let sampleIndex = ghost.samples.findIndex(
        (sample) => sample.timestamp > time
      );
      if (sampleIndex === -1) sampleIndex = ghost.samples.length - 2;
      const sample = ghost.samples[sampleIndex];
      const sampleTransform = sample.transform as Transform;

      const samplePosition = sampleTransform.position;
      carMesh.position.set(
        samplePosition.x,
        samplePosition.y,
        samplePosition.z
      );

      carMesh.rotation.setFromQuaternion(sampleTransform.rotation.toTHREE());

      if (resizeRendererToDisplaySize()) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      const nextSample =
        ghost.samples[Math.min(sampleIndex + 1, ghost.samples.length - 1)];

      const sampleVelocity = nextSample
        .transform!.position.sub(sampleTransform.position)
        .toTHREE()
        .normalize();
      const cameraPosition = carMesh.position
        .clone()
        .sub(sampleVelocity.multiplyScalar(20));
      camera.position.set(
        cameraPosition.x,
        cameraPosition.y + 8,
        cameraPosition.z
      );
      camera.lookAt(carMesh.position);

      renderer.render(scene, camera);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }, [canvasRef, ghost, map]);

  return <canvas ref={canvasRef}></canvas>;
}
