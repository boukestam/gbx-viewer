import * as THREE from "three";

export function initSun(scene: THREE.Scene) {
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

  return sun;
}