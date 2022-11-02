import React, { createRef, useEffect } from "react";
import { Environment } from "./parser/nodes";

import * as THREE from "three";
import { OrbitControls } from "./orbit";
import { Vec3, Transform } from "./parser/types";
import { GhostSamples } from "./App";
import { createRoad, createCube } from "./MeshGenerator";

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
    const near = 1;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.x = 1000;
    camera.position.y = 200;
    camera.position.z = 800;
    camera.lookAt(new THREE.Vector3(camera.position.x, 0, camera.position.z));

    let controlType: "free" | "follow" = "follow";
    const controls = new OrbitControls(camera, renderer.domElement);

    const scene = new THREE.Scene();

    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(-1, 2, 4);
    scene.add(sun);

    const sky = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(sky);

    for (const block of map.blocks) {
      if (!block.blockName.includes("Road")) continue;

      const blockMesh = createRoad(block.blockName);

      blockMesh.mesh.position.set(
        block.x * 32 - blockMesh.offset.x,
        block.y * 8 - 64,
        block.z * 32 - blockMesh.offset.z
      );
      blockMesh.mesh.rotateY(-block.rotation * (Math.PI / 2) + Math.PI);

      scene.add(blockMesh.mesh);
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

    const roadBlocks = map.blocks.filter((block) =>
      block.blockName.includes("Road")
    );

    console.log(roadBlocks);
    console.log(roadBlocks.map((block) => block.blockName));

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

      if (controlType === "follow") {
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
      } else if (controlType === "free") {
        controls.update();
      }

      renderer.render(scene, camera);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }, [canvasRef, ghost, map]);

  return <canvas ref={canvasRef}></canvas>;
}
