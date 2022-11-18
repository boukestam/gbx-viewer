import * as THREE from "three";
import { GhostSamples } from "../App";
import { CGameCtnChallenge } from "../parser/nodes";
import { Transform } from "../parser/types";
import { hexToSrgb } from "../utils/color";
import { loadBlocks } from "./blocks";
import { Camera } from "./camera";

const { GLTFLoader } = require("three/addons/loaders/GLTFLoader.js");

export function startRender(canvas: HTMLCanvasElement, map: CGameCtnChallenge, ghost: GhostSamples) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x00b4e2);

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 1;
  const far = 10000;
  const camera = new Camera(fov, aspect, near, far);

  const scene = new THREE.Scene();

  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.castShadow = true;
  scene.add(sun);

  const shadowMapSize = 400;

  sun.shadow.mapSize.width = 4096;
  sun.shadow.mapSize.height = 4096;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 5000;
  sun.shadow.camera.left = -shadowMapSize;
  sun.shadow.camera.right = shadowMapSize;
  sun.shadow.camera.top = -shadowMapSize;
  sun.shadow.camera.bottom = shadowMapSize;

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

  const trackCenter = loadBlocks(map, scene);
  camera.init(trackCenter);
  camera.start();

  function resizeRendererToDisplaySize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  const loader = new GLTFLoader();

  let car: THREE.Object3D;

  loader.load(
    "models/car.glb",

    // onLoad callback
    function (obj: any) {
      car = obj.scene;
      car.traverse((node: any) => {
        node.castShadow = true;
      });
      scene.add(car);
    },

    undefined, // onProgress callback

    // onError callback
    function (err: any) {
      console.error("An error happened");
      console.error(err);
    }
  );

  let startTime = -1;
  let animationFrame = 0;
  let previousTime = 0;

  function render(time: number) {
    let originalTime = time;

    const delta = (time - previousTime) / 1000;
    previousTime = time;

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
      render(originalTime);
      return;
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

    camera.update(delta, car, sun, sample, ghost.samples[Math.min(sampleIndex + 1, ghost.samples.length - 1)]);

    renderer.render(scene, camera);

    animationFrame = requestAnimationFrame(render);
  }

  animationFrame = requestAnimationFrame(render);

  return () => {
    camera.dispose();

    cancelAnimationFrame(animationFrame);
  };
}