import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/**
 * A floor-standing bookshelf with room for up to ten cassettes standing
 * side by side in one long compartment.
 */
export function createShelf() {
  const group = new THREE.Group();

  const matWood = new THREE.MeshStandardMaterial({ color: 0x6a4a30, metalness: 0.05, roughness: 0.72 });
  const matWoodDark = new THREE.MeshStandardMaterial({ color: 0x523823, metalness: 0.05, roughness: 0.8 });

  const W = 7.5; // length of the shelf
  const D = 4.6; // depth — a cassette stored spine-out runs 4.4 deep
  const BOARD = 0.14;
  const STAND = 0.23; // top surface of the bottom board
  const CAP_Y = 3.15; // top cap (underside at 3.08 -> 2.85 of clearance)

  const board = (y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(W, BOARD, D), matWood);
    m.position.set(0, y, 0);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };
  board(0.16); // bottom board
  board(CAP_Y); // top cap

  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(BOARD, 3.2, D), matWood);
    side.position.set(sx * (W / 2 - BOARD / 2), 1.63, 0);
    side.castShadow = true;
    side.receiveShadow = true;
    group.add(side);
  }

  const back = new THREE.Mesh(new THREE.BoxGeometry(W, 3.08, 0.06), matWoodDark);
  back.position.set(0, 1.63, -D / 2 + 0.03);
  back.receiveShadow = true;
  group.add(back);

  // front plinth strip along the bottom edge
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(W, 0.22, 0.06), matWoodDark);
  plinth.position.set(0, 0.25, D / 2 - 0.03);
  plinth.castShadow = true;
  group.add(plinth);

  // feet
  for (const sx of [-1, 1]) {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.09, D), matWoodDark);
    foot.position.set(sx * (W / 2 - 0.35), 0.045, 0);
    group.add(foot);
  }

  // invisible drop zone covering the whole compartment
  const zone = new THREE.Mesh(
    new THREE.BoxGeometry(W, 2.8, D + 0.1),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  zone.position.y = 1.6;
  group.add(zone);

  // ten standing slots along the row; tapes rest against the back panel,
  // spines recessed a little behind the front edge
  const slots = [];
  for (let i = 0; i < 10; i++) {
    slots.push({ position: new THREE.Vector3(-3.15 + i * 0.7, STAND + 1.375, -(D / 2 - 0.06) + 2.2) });
  }

  return { group, slots, zone };
}
