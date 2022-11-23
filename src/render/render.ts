import * as THREE from "three";
import { GhostSamples } from "../App";
import { CGameCtnChallenge } from "../parser/nodes";
import { Transform } from "../parser/types";
import { hexToSrgb } from "../utils/color";
import { loadBlocks } from "./blocks";
import { Camera } from "./camera";
import { Trail } from "./trail";

const { GLTFLoader } = require("three/addons/loaders/GLTFLoader.js");

export function startRender(canvas: HTMLCanvasElement, map: CGameCtnChallenge, ghost: GhostSamples) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0xA7CBFE);

  const camera = new Camera(45, canvas.width / canvas.height, 1, 10000);

  const scene = new THREE.Scene();

  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 50, 0 );
  scene.add( hemiLight );

  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.color.setHSL( 0.1, 1, 0.95 );
  sun.castShadow = true;
  scene.add(sun);

  const shadowMapSize = 1000;

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
  let wheelFrontLeft: THREE.Object3D;
  let wheelFrontRight: THREE.Object3D;
  let wheelBackLeft: THREE.Object3D;
  let wheelBackRight: THREE.Object3D;
  let wheels: THREE.Object3D[];
  let frontWheels: THREE.Object3D[];

  let wheelRotation = 0;
  let wheelAngle = 0;

  const wheelTrails: Trail[] = [];

  loader.load(
    "models/car.glb",

    // onLoad callback
    function (obj: any) {
      car = obj.scene;
      car.traverse((node: any) => {
        if (node.name === 'WheelFrontLeft') wheelFrontLeft = node;
        if (node.name === 'WheelFrontRight') wheelFrontRight = node;
        if (node.name === 'WheelBackLeft') wheelBackLeft = node;
        if (node.name === 'WheelBackRight') wheelBackRight = node;

        node.castShadow = true;
      });
      
      wheels = [wheelFrontLeft, wheelFrontRight, wheelBackLeft, wheelBackRight];
      frontWheels = [wheelFrontLeft, wheelFrontRight];

      for (const wheel of wheels) {
        // specify points to create planar trail-head geometry
        var trailHeadGeometry = [];
        trailHeadGeometry.push( 
          new THREE.Vector3( -1.0, 0.0, 0.0 ), 
          new THREE.Vector3( 0.0, 0.0, 0.0 ), 
          new THREE.Vector3( 1.0, 0.0, 0.0 ) 
        );

        const trail = new Trail(scene, wheel, new THREE.Vector3( 0.0, 0.0, 0.0 ));

        wheelTrails.push(trail);
      }
      
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
    const nextSample = ghost.samples[Math.min(sampleIndex + 1, ghost.samples.length - 1)];

    if (car) {
      const samplePosition = sampleTransform.position;
      car.position.set(samplePosition.x, samplePosition.y, samplePosition.z);
      car.rotation.setFromQuaternion(sampleTransform.rotation.toTHREE());

      const steer = sample.steer || 0;
      const diff = steer - wheelAngle;
      if (diff < 0) {
        wheelAngle = Math.max(steer, wheelAngle - delta * 10);
      } else if (diff > 0) {
        wheelAngle = Math.min(steer, wheelAngle + delta * 10);
      }

      for (const wheel of wheels) {
        wheelRotation += sampleTransform.speed * 0.1 * delta;

        wheel.rotation.set(
          wheelRotation, 
          frontWheels.includes(wheel) ? wheelAngle * -0.35 : 0, 
          0,
          'YXZ'
        );
      }
      
      for (const trail of wheelTrails) {
        trail.advance();
      }
    }

    if (resizeRendererToDisplaySize()) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    camera.update(delta, car, sun, sample, nextSample);

    renderer.render(scene, camera);

    animationFrame = requestAnimationFrame(render);
  }

  animationFrame = requestAnimationFrame(render);

  return () => {
    camera.dispose();

    cancelAnimationFrame(animationFrame);
  };
}