import * as THREE from "three";
import { GhostSamples } from "../App";
import { CGameCtnChallenge } from "../parser/nodes";
import { loadBlocks } from "./blocks";
import { Camera } from "./camera";
import { Car } from "./car";
import { initSun } from "./sun";
import { TimeControls } from "./timeControls";

const { EffectComposer } = require('three/addons/postprocessing/EffectComposer.js');
const { RenderPass } = require('three/addons/postprocessing/RenderPass.js');
const { SMAAPass } = require('three/addons/postprocessing/SMAAPass.js');
const Stats = require('three/addons/libs/stats.module.js');

export function startRender(container: HTMLDivElement, canvas: HTMLCanvasElement, map: CGameCtnChallenge, ghost?: GhostSamples) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.scrollWidth, canvas.scrollHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0xA7CBFE);

  const stats = Stats.default();
	container.appendChild(stats.dom);

  let timeControls: TimeControls | undefined;
  if (ghost) {
    timeControls = new TimeControls(ghost);
    container.appendChild(timeControls.dom);

    timeControls.onReset = () => car.resetTrails();
  }

  const camera = new Camera(45, canvas.width / canvas.height, 1, 10000);

  const scene = new THREE.Scene();
  const sun = initSun(scene);

  const car = new Car();
  car.load(scene);

  // Post processing

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // composer.addPass(new SMAAPass( 
  //   window.innerWidth * renderer.getPixelRatio(), 
  //   window.innerHeight * renderer.getPixelRatio() 
  // ));

  const trackCenter = loadBlocks(map, scene);
  camera.init(trackCenter);
  camera.start(canvas);

  function onWindowResize() {
    const width = canvas.scrollWidth;
    const height = canvas.scrollHeight;
    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      composer.setSize(width, height);
    }

    return needResize;
  }

  window.addEventListener('resize', onWindowResize);

  let animationFrame = 0;
  let previousTime = 0;

  function render(t: number) {
    animationFrame = requestAnimationFrame(render);

    stats.begin();

    const delta = (t - previousTime) / 1000;
    previousTime = t;

    if (timeControls) {
      timeControls.update(delta);
      const {sample, nextSample} = timeControls.sample();

      car.update(delta, sample);

      camera.update(delta, car.model, sun, sample, nextSample);
    } else {
      camera.update(delta, car.model, sun);
    }

    composer.render();

    stats.end();
  }

  animationFrame = requestAnimationFrame(render);

  return () => {
    window.removeEventListener('resize', onWindowResize);

    camera.dispose();

    cancelAnimationFrame(animationFrame);

    container.innerHTML = '';
  };
}