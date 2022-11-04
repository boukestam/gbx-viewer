import React, { createRef, useEffect } from "react";
import { Environment } from "./parser/nodes";

import * as THREE from "three";
import { Transform, Vec3 } from "./parser/types";
import { GhostSamples } from "./App";
import { createRoad, hexToSrgb } from "./MeshGenerator";

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
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    let controlType: "free" | "follow" = "follow";

    const scene = new THREE.Scene();

    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.castShadow = true;
    scene.add(sun);

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 1000;
    sun.shadow.camera.left = -500;
    sun.shadow.camera.right = 500;
    sun.shadow.camera.top = -500;
    sun.shadow.camera.bottom = 500;

    const sky = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(sky);

    const planeGeometry = new THREE.PlaneGeometry(1, 1);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: hexToSrgb("#6A8642").toTHREE(),
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);
    plane.scale.x = 100000;
    plane.scale.y = 100000;
    plane.translateZ(8);
    plane.receiveShadow = true;
    scene.add(plane);

    const trackCenter = Vec3.zero();

    const roadBlocks = map.blocks.filter((block) =>
      block.blockName.includes("Road")
    );

    for (const block of roadBlocks) {
      const blockMesh = createRoad(block.blockName);

      const mesh = blockMesh.mesh.clone();

      const pos = new Vec3(block.x * 32, block.y * 8 - 64, block.z * 32).sub(
        blockMesh.offset
      );

      mesh.rotateY(-block.rotation * (Math.PI / 2) + Math.PI);
      mesh.position.set(pos.x, pos.y, pos.z);

      trackCenter.add(pos.div(roadBlocks.length));

      scene.add(mesh);
    }

    camera.position.x = 1000;
    camera.position.y = 100;
    camera.position.z = 900;
    camera.lookAt(trackCenter.toTHREE());

    function resizeRendererToDisplaySize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }

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

      // onError callback
      function (err: any) {
        console.error("An error happened");
        console.error(err);
      }
    );

    const keydownListener = (e: KeyboardEvent) => {
      console.log(e.key);
      keys[e.key] = true;
    };
    const keyupListener = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    const mousedownListener = (e: MouseEvent) => {
      keys["Mouse" + e.button] = true;
    };
    const mouseupListener = (e: MouseEvent) => {
      keys["Mouse" + e.button] = false;
    };
    const mousemoveListener = (e: MouseEvent) => {
      if (keys["Mouse0"]) {
        camera.quaternion.y -= e.movementX * 0.002;
        camera.quaternion.x -= e.movementY * 0.002;
        camera.quaternion.normalize();
        camera.up.set(0, 1, 0);
      }
    };

    const keys: { [key: string]: boolean } = {};
    document.addEventListener("keydown", keydownListener);
    document.addEventListener("keyup", keyupListener);
    document.addEventListener("mouseup", mouseupListener);
    document.addEventListener("mousedown", mousedownListener);
    document.addEventListener("mousemove", mousemoveListener);

    let startTime = -1;
    let animationFrame = 0;

    function render(time: number) {
      let originalTime = time;

      if (startTime === -1) {
        startTime = time;
        time = 0;
      } else {
        time -= startTime;
      }

      let sampleIndex = ghost.samples.findIndex(
        (sample) => sample.timestamp > time
      );
      if (sampleIndex === -1) {
        startTime = originalTime;
        return requestAnimationFrame(render);
      }
      const sample = ghost.samples[sampleIndex];
      const sampleTransform = sample.transform as Transform;

      if (car) {
        const samplePosition = sampleTransform.position;
        car.position.set(samplePosition.x, samplePosition.y, samplePosition.z);

        car.rotation.setFromQuaternion(sampleTransform.rotation.toTHREE());

        sun.position.set(car.position.x, car.position.y + 500, car.position.z);
        sun.target = car;
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
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        const right = direction
          .clone()
          .cross(new THREE.Vector3(0, 1, 0))
          .normalize();

        if (keys["ArrowUp"] || keys["w"]) {
          camera.position.addScaledVector(direction, 10);
        }

        if (keys["ArrowDown"] || keys["s"]) {
          camera.position.addScaledVector(direction, -10);
        }

        if (keys["ArrowLeft"] || keys["a"]) {
          camera.position.addScaledVector(right, -10);
        }

        if (keys["ArrowRight"] || keys["d"]) {
          camera.position.addScaledVector(right, 10);
        }
      }

      renderer.render(scene, camera);

      animationFrame = requestAnimationFrame(render);
    }

    animationFrame = requestAnimationFrame(render);

    return () => {
      document.removeEventListener("keydown", keydownListener);
      document.removeEventListener("keyup", keyupListener);
      document.removeEventListener("mouseup", mouseupListener);
      document.removeEventListener("mousedown", mousedownListener);
      document.removeEventListener("mousemove", mousemoveListener);

      cancelAnimationFrame(animationFrame);
    };
  }, [canvasRef, ghost, map]);

  return <canvas ref={canvasRef} style={{ userSelect: "none" }}></canvas>;
}
