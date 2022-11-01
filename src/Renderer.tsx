import React, { createRef, useEffect } from "react";
import { Environment } from "./parser/nodes";

import * as THREE from "three";
import { OrbitControls } from "./orbit";
import { Vec3 } from "./parser/parser";

function triangle(a: Vec3, b: Vec3, c: Vec3, out: number[]) {
  out.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
}

function shape(points: Vec3[], direction: Vec3, steps: number, out: number[]) {
  let center = Vec3.zero();
  for (const point of points) {
    center = center.add(point.div(points.length));
  }

  for (let i = 0; i < points.length; i++) {
    triangle(points[i], points[(i + 1) % points.length], center, out);
  }

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < points.length; j++) {
      const next = (j + 1) % points.length;
      triangle(
        points[j].add(direction.mul(i)),
        points[next].add(direction.mul(i + 1)),
        points[j].add(direction.mul(i + 1)),
        out
      );
      triangle(
        points[j].add(direction.mul(i)),
        points[next].add(direction.mul(i)),
        points[next].add(direction.mul(i + 1)),
        out
      );
    }
  }

  for (let i = 0; i < points.length; i++) {
    triangle(
      points[i].add(direction.mul(steps)),
      points[(i + 1) % points.length].add(direction.mul(steps)),
      center.add(direction.mul(steps)),
      out
    );
  }
}

export function Renderer({ map }: { map: Environment }) {
  const canvasRef = createRef<HTMLCanvasElement>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 50;
    camera.position.x = 20;
    camera.position.y = 20;

    const controls = new OrbitControls(camera, renderer.domElement);

    const scene = new THREE.Scene();

    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(-1, 2, 4);
    scene.add(sun);

    const sky = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(sky);

    const size = 0.5;
    const points = [
      new Vec3(-size, 0, -size),
      new Vec3(-size, 0, size),
      new Vec3(size, 0, size),
      new Vec3(size, 0, -size),
    ];

    const verts: number[] = [];
    shape(points, new Vec3(0, size * 2, 0), 1, verts);

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(verts);

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);

    console.log(
      map.blocks
        .map((block) => block.blockName)
        .filter((name, index, array) => array.indexOf(name) === index)
    );

    for (const block of map.blocks) {
      //if (!block.blockName.includes("Road")) continue;

      const obj = mesh.clone();

      obj.position.set(block.x, block.y, block.z);

      scene.add(obj);
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

    function render(time: number) {
      time *= 0.001;

      if (resizeRendererToDisplaySize()) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      controls.update();

      renderer.render(scene, camera);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}
