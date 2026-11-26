import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { makeCassetteLabel, makeCassetteStrip, makeSpineLabel } from "./textures.js";

/** Rounded rectangle as a THREE.Shape (optionally offset from the origin). */
export function roundedRectShape(w, h, r, cx = 0, cy = 0) {
  const s = new THREE.Shape();
  const x = cx - w / 2;
  const y = cy - h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Flat ring (annulus) with thickness, e.g. a cassette hub. */
function ringGeometry(outer, inner, depth) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 48 });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

export function createCassette({ title, accent } = {}) {
  const group = new THREE.Group();

  const shellMat = new THREE.MeshStandardMaterial({ color: 0x14161b, metalness: 0.15, roughness: 0.6 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xd9d3bd, metalness: 0.05, roughness: 0.5 });
  const tapeMat = new THREE.MeshStandardMaterial({ color: 0x241a10, metalness: 0, roughness: 0.92 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x9fa6b0, metalness: 1, roughness: 0.35 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4e4ea,
    metalness: 0,
    roughness: 0.06,
    transparent: true,
    opacity: 0.13,
    side: THREE.DoubleSide,
    envMapIntensity: 1.4,
  });

  const W = 4.4;
  const H = 2.75;
  const D = 0.62;
  const HALF = D / 2;

  // ---- shell: back plate + front plate (with window hole) + connecting walls ----
  const back = new THREE.Mesh(new RoundedBoxGeometry(W, H, 0.16, 2, 0.05), shellMat);
  back.position.z = -HALF + 0.08;

  const frontShape = roundedRectShape(W, H, 0.06);
  frontShape.holes.push(roundedRectShape(2.3, 1.62, 0.08));
  const front = new THREE.Mesh(
    new THREE.ExtrudeGeometry(frontShape, { depth: 0.16, bevelEnabled: false, curveSegments: 24 }),
    shellMat,
  );
  front.position.z = HALF - 0.16;

  const walls = new THREE.Group();
  const topWall = new THREE.Mesh(new THREE.BoxGeometry(W - 0.12, 0.16, D - 0.32), shellMat);
  topWall.position.set(0, H / 2 - 0.08, 0);
  const bottomWall = topWall.clone();
  bottomWall.position.y = -H / 2 + 0.08;
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, H - 0.32, D - 0.32), shellMat);
  leftWall.position.set(-W / 2 + 0.08, 0, 0);
  const rightWall = leftWall.clone();
  rightWall.position.x = W / 2 - 0.08;
  walls.add(topWall, bottomWall, leftWall, rightWall);

  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.62), glassMat);
  winGlass.position.z = HALF + 0.002;

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(4.14, 0.53),
    new THREE.MeshStandardMaterial({ map: makeCassetteLabel(title, accent), roughness: 0.85, metalness: 0 }),
  );
  label.position.set(0, 1.09, HALF + 0.004);

  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(4.14, 0.3),
    new THREE.MeshStandardMaterial({ map: makeCassetteStrip(), roughness: 0.85, metalness: 0 }),
  );
  strip.position.set(0, -1.09, HALF + 0.004);

  // spine label on the +x side face, visible when the tape is stored like a book
  const spine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 2.7),
    new THREE.MeshStandardMaterial({ map: makeSpineLabel(title, accent), roughness: 0.85, metalness: 0 }),
  );
  spine.rotation.y = Math.PI / 2;
  spine.position.set(W / 2 + 0.002, 0, 0);

  group.add(back, front, walls, winGlass, label, strip, spine);

  // ---- corner screws ----
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16), steelMat);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(sx * 2.02, sy * 1.18, HALF + 0.01);
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.016, 0.02), shellMat);
      slot.position.set(sx * 2.02, sy * 1.18, HALF + 0.036);
      slot.rotation.z = sx * sy * 0.6;
      group.add(screw, slot);
    }
  }

  // ---- reels ----
  function makeReel() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(ringGeometry(0.36, 0.205, 0.22), hubMat));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.22), hubMat);
      tooth.position.set(Math.cos(a) * 0.16, Math.sin(a) * 0.16, 0);
      tooth.rotation.z = a;
      g.add(tooth);
    }
    const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.34, 64), tapeMat);
    spool.rotation.x = Math.PI / 2;
    g.add(spool);
    return { group: g, spool };
  }

  const reelL = makeReel();
  reelL.group.position.set(-0.92, 0, 0.02);
  const reelR = makeReel();
  reelR.group.position.set(0.92, 0, 0.02);
  group.add(reelL.group, reelR.group);

  // ---- tape path across the bottom of the window ----
  const tapeBar = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.05, 0.3), tapeMat);
  tapeBar.position.set(0, -0.66, 0);
  group.add(tapeBar);

  group.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return { group, reelL, reelR, title, accent };
}
