import React, { createRef, useEffect } from "react";
import { Environment } from "./parser/nodes";

import * as THREE from "three";
import { OrbitControls } from "./orbit";
import { Transform } from "./parser/types";
import { GhostSamples } from "./App";
import { createRoad } from "./MeshGenerator";

const { GLTFLoader } = require("three/addons/loaders/GLTFLoader.js");

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

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x00b4e2);

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

    const sun = new THREE.DirectionalLight(0xffffff, 0.5);
    sun.position.set(-1000, 2000, 4000);
    sun.castShadow = true;
    scene.add(sun);

    sun.shadow.mapSize.width = 512; // default
    sun.shadow.mapSize.height = 512; // default
    sun.shadow.camera.near = 0.5; // default
    sun.shadow.camera.far = 500; // default

    const helper = new THREE.CameraHelper(sun.shadow.camera);
    scene.add(helper);

    const sky = new THREE.AmbientLight(0xffffff, 0.8);
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

    const loader = new GLTFLoader();

    let car: THREE.Object3D;

    loader.load(
      "models/car.glb",

      // onLoad callback
      function (obj: any) {
        console.log(obj);
        car = obj.scene;
        car.traverse((node: any) => {
          node.castShadow = true;
        });
        scene.add(car);
      },

      // onProgress callback
      function (xhr: any) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },

      // onError callback
      function (err: any) {
        console.error("An error happened");
        console.error(err);
      }
    );

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
      if (sampleIndex === -1) {
        startTime = time;
        return requestAnimationFrame(render);
      }
      const sample = ghost.samples[sampleIndex];
      const sampleTransform = sample.transform as Transform;

      if (car) {
        const samplePosition = sampleTransform.position;
        car.position.set(samplePosition.x, samplePosition.y, samplePosition.z);

        car.rotation.setFromQuaternion(sampleTransform.rotation.toTHREE());
      }

      if (resizeRendererToDisplaySize()) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      if (controlType === "follow" && car) {
        const nextSample =
          ghost.samples[Math.min(sampleIndex + 1, ghost.samples.length - 1)];

        const sampleVelocity = nextSample
          .transform!.position.sub(sampleTransform.position)
          .toTHREE()
          .normalize();
        const cameraPosition = car.position
          .clone()
          .sub(sampleVelocity.multiplyScalar(20));
        camera.position.set(
          cameraPosition.x,
          cameraPosition.y + 8,
          cameraPosition.z
        );
        camera.lookAt(car.position);
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
