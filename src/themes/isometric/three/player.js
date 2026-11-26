import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { roundedRectShape } from "./cassette.js";
import { makeKeyIcon, makeTinyLabel, makeWalkmanBadge } from "./textures.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// shared transport constants (youtube.js reads these too)
export const TAPE_MIN = 0.03;
export const TAPE_MAX = 0.97;
export const TAPE_RATE = 0.0042; // fraction of tape moved per second at PLAY speed
export const SIDE_SECONDS = 224; // how long one side takes to play through

/**
 * Walkman-style personal stereo: a flat blue slab with the cassette lying
 * inside under a clear lid, transport keys poking up from the top face, and a
 * volume thumbwheel + headphone jack on the front.
 */
export function createCassettePlayer() {
  const root = new THREE.Group();
  const pressables = [];

  // ---------- materials ----------
  const matBody = new THREE.MeshStandardMaterial({ color: 0x4d7cb3, metalness: 0.85, roughness: 0.4 });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x0d0e10, metalness: 0.1, roughness: 0.9 });
  const matChrome = new THREE.MeshStandardMaterial({ color: 0xd8dde3, metalness: 1, roughness: 0.16 });
  const matKey = new THREE.MeshStandardMaterial({ color: 0x23262c, metalness: 0.6, roughness: 0.35 });
  const matIvory = new THREE.MeshStandardMaterial({ color: 0xe8e3d2, roughness: 0.6 });
  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0xc4d8e2,
    metalness: 0,
    roughness: 0.05,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    envMapIntensity: 1.6,
  });

  // ---------- shell ----------
  const base = new THREE.Mesh(new RoundedBoxGeometry(5.6, 0.4, 3.8, 3, 0.1), matBody);
  base.position.set(0, 0.26, 0);
  base.castShadow = true;
  base.receiveShadow = true;
  root.add(base);

  // mid walls closing the shell around the cassette bay (front, back, sides)
  const wall = (w, d, x, z) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, 0.49, d, 2, 0.06), matBody);
    m.position.set(x, 0.705, z);
    m.castShadow = true;
    m.receiveShadow = true;
    root.add(m);
  };
  wall(5.6, 0.5, 0, 1.65); // front (z 1.4 .. 1.9)
  wall(5.6, 0.475, 0, -1.6625); // back  (z -1.9 .. -1.425)
  wall(0.55, 2.94, -2.525, -0.01);
  wall(0.55, 2.94, 2.525, -0.01);

  // dark liner the cassette sits on
  const liner = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.65), matDark);
  liner.rotation.x = -Math.PI / 2;
  liner.position.set(0, 0.465, -0.1);
  liner.receiveShadow = true;
  root.add(liner);

  // ---------- cassette bay ----------
  const BAY_POS = new THREE.Vector3(0, 0.77, 0);
  const BAY_ROT = new THREE.Euler(-Math.PI / 2, 0, 0);

  // invisible drop zone above the bay (drag target)
  const insertTarget = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 2.6, 3.6),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  insertTarget.position.set(0, 1.6, 0);
  root.add(insertTarget);

  // ---------- top plate with the window opening ----------
  const plateShape = roundedRectShape(5.4, 3.6, 0.2);
  plateShape.holes.push(roundedRectShape(4.5, 2.65, 0.12, 0, 0.1));
  const plate = new THREE.Mesh(
    new THREE.ExtrudeGeometry(plateShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 24,
    }),
    matBody,
  );
  plate.rotation.x = -Math.PI / 2;
  plate.position.set(0, 0.98, 0);
  plate.castShadow = true;
  plate.receiveShadow = true;
  root.add(plate);

  // ---------- clear lid over the window ----------
  const door = new THREE.Group();
  door.position.set(0, 1.11, -1.425); // hinge at the back edge of the opening
  const lid = new THREE.Mesh(new THREE.PlaneGeometry(4.56, 2.7), matGlass);
  lid.rotation.x = -Math.PI / 2;
  lid.position.set(0, 0.01, 1.3);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.7, 16), matChrome);
  rod.rotation.z = Math.PI / 2;
  const tab = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.06, 0.18, 2, 0.02), matChrome);
  tab.position.set(0, 0.02, 2.52);
  door.add(lid, rod, tab);
  root.add(door);

  // ---------- transport keys along the top face ----------
  const DEFS = [
    { action: "rew", w: 0.5 },
    { action: "play", w: 0.66 },
    { action: "ff", w: 0.5 },
    { action: "stop", w: 0.5 },
    { action: "pause", w: 0.4 },
    { action: "eject", w: 0.5 },
  ];
  const GAP = 0.12;
  const totalW = DEFS.reduce((s, d) => s + d.w, 0) + GAP * (DEFS.length - 1);
  const buttons = [];
  let cursor = -totalW / 2;
  for (const def of DEFS) {
    const cx = cursor + def.w / 2;
    const cap = new THREE.Mesh(new RoundedBoxGeometry(def.w, 0.5, 0.4, 2, 0.05), matKey);
    cap.position.set(cx, 1.2, 1.5);
    cap.castShadow = true;
    cap.userData.action = def.action;
    const icon = new THREE.Mesh(
      new THREE.PlaneGeometry(def.w - 0.16, def.w - 0.16),
      new THREE.MeshBasicMaterial({ map: makeKeyIcon(def.action), transparent: true }),
    );
    icon.rotation.x = -Math.PI / 2;
    icon.position.set(cx, 1.453, 1.5);
    root.add(cap, icon);
    pressables.push(cap);
    buttons.push({ action: def.action, cap, icon, restY: 1.2, t: 1, latched: false });
    cursor += def.w + GAP;
  }

  // ---------- front face: badge, volume thumbwheel, headphone jack ----------
  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 0.52),
    new THREE.MeshStandardMaterial({ map: makeWalkmanBadge(), transparent: true, roughness: 0.45, metalness: 0.15 }),
  );
  badge.position.set(-0.65, 0.6, 1.905);
  root.add(badge);

  const dialGroup = new THREE.Group();
  dialGroup.position.set(1.85, 0.585, 2.0);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.26, 48), matKey);
  dial.rotation.x = Math.PI / 2;
  dial.castShadow = true;
  dial.userData.action = "volume";
  const dialPointer = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.16, 0.03), matIvory);
  dialPointer.position.set(0, 0.24, 0.135);
  dialGroup.add(dial, dialPointer);
  const dialRing = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.02, 12, 48), matChrome);
  dialRing.position.set(1.85, 0.585, 1.905);
  root.add(dialGroup, dialRing);
  pressables.push(dial);

  const jackRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 12, 32), matChrome);
  jackRing.position.set(-2.2, 0.585, 1.905);
  const jackHole = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), matDark);
  jackHole.position.set(-2.2, 0.585, 1.91);
  root.add(jackRing, jackHole);

  const frontLabel = (text, x, y) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.75, 0.19),
      new THREE.MeshBasicMaterial({ map: makeTinyLabel(text), transparent: true }),
    );
    m.position.set(x, y, 1.905);
    root.add(m);
  };
  frontLabel("VOLUME", 1.85, 0.14);
  frontLabel("PHONES", -2.2, 0.14);

  // corner screws on the front face
  for (const sx of [-1, 1]) {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16), matChrome);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(sx * 2.6, 0.72, 1.902);
    root.add(screw);
  }

  // STEREO marking on the top face
  const stereo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.18),
    new THREE.MeshBasicMaterial({ map: makeTinyLabel("STEREO"), transparent: true }),
  );
  stereo.rotation.x = -Math.PI / 2;
  stereo.position.set(2.32, 1.115, -0.7);
  root.add(stereo);

  // ---------- feet ----------
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 16), matDark);
      foot.position.set(sx * 2.55, 0.03, sz * 1.6);
      root.add(foot);
    }
  }

  // ---------- transport state ----------
  const hooks = { onModeChange: null, onVolume: null };
  let mode = "stopped";
  let tapeF = 0.82; // fraction of tape wound on the left (supply) reel
  let doorOpen = false;
  let doorAngle = 0;
  let installed = null;
  let insertAnim = null;
  let volumeStep = 1; // 0..3, stepped by the thumbwheel
  const VOLUME_ANGLES = [0.85, 0.28, -0.28, -0.85];

  function setMode(m) {
    mode = m;
    for (const b of buttons) {
      b.latched =
        (b.action === "play" && (m === "playing" || m === "paused")) ||
        (b.action === "pause" && m === "paused") ||
        (b.action === "rew" && m === "rew") ||
        (b.action === "ff" && m === "ff");
    }
    if (hooks.onModeChange) hooks.onModeChange(m);
  }
  setMode("stopped");

  function setDoorOpen(open) {
    doorOpen = open;
  }

  /**
   * Inserts a tape into the bay. Returns { ok, previous } — previous is the
   * tape that was installed before (or null). Refuses while an insertion
   * animation is still running.
   */
  function install(tape, instant = false) {
    if (insertAnim) return { ok: false, previous: null };
    const previous = installed;
    installed = tape;
    root.attach(tape.group);
    if (instant) {
      tape.group.position.copy(BAY_POS);
      tape.group.rotation.copy(BAY_ROT);
      doorOpen = false;
      setMode("playing");
    } else {
      insertAnim = {
        t: 0,
        dur: 0.42,
        fromPos: tape.group.position.clone(),
        fromRot: tape.group.rotation.clone(),
      };
    }
    return { ok: true, previous };
  }

  /** Removes the installed tape and leaves it in world space at its pose. */
  function remove() {
    const tape = installed;
    if (!tape) return null;
    installed = null;
    setMode("stopped");
    root.parent.attach(tape.group);
    return tape;
  }

  function press(action) {
    const b = buttons.find((k) => k.action === action);
    if (b) b.t = 0;
    switch (action) {
      case "play":
        if (mode !== "playing") setMode("playing");
        break;
      case "pause":
        if (mode === "playing") setMode("paused");
        else if (mode === "paused") setMode("playing");
        break;
      case "stop":
        setMode("stopped");
        break;
      case "rew":
        setMode("rew");
        break;
      case "ff":
        setMode("ff");
        break;
      case "eject":
        doorOpen = !doorOpen;
        if (doorOpen) setMode("stopped");
        break;
      case "volume":
        volumeStep = (volumeStep + 1) % 4;
        if (hooks.onVolume) hooks.onVolume(volumeStep);
        break;
    }
  }

  function update(dt, t) {
    // lid swing
    const doorTarget = doorOpen ? -1.35 : 0;
    doorAngle += (doorTarget - doorAngle) * Math.min(1, dt * 5);
    door.rotation.x = doorAngle;

    // tape insertion animation (local pose inside the bay)
    if (insertAnim && installed) {
      insertAnim.t += dt;
      const k = Math.min(1, insertAnim.t / insertAnim.dur);
      const e = k * k * (3 - 2 * k);
      installed.group.position.lerpVectors(insertAnim.fromPos, BAY_POS, e);
      installed.group.rotation.set(
        insertAnim.fromRot.x + (BAY_ROT.x - insertAnim.fromRot.x) * e,
        insertAnim.fromRot.y * (1 - e),
        insertAnim.fromRot.z * (1 - e),
      );
      if (k >= 1) {
        installed.group.position.copy(BAY_POS);
        installed.group.rotation.copy(BAY_ROT);
        insertAnim = null;
        doorOpen = false;
        setMode("playing");
      }
    }

    // volume thumbwheel eases to its setting
    dialGroup.rotation.z += (VOLUME_ANGLES[volumeStep] - dialGroup.rotation.z) * Math.min(1, dt * 8);

    // key travel (keys press down into the body)
    for (const b of buttons) {
      b.t += dt;
      let f;
      if (b.latched) f = 1;
      else if (b.t < 0.05) f = b.t / 0.05;
      else f = Math.max(0, 1 - (b.t - 0.05) / 0.2);
      const y = b.restY - 0.12 * f;
      b.cap.position.y = y;
      b.icon.position.y = y + 0.253;
    }

    // tape transport: spool radii track how much tape sits on each side
    const speed = mode === "playing" ? 1 : mode === "ff" ? 5.2 : mode === "rew" ? -5.2 : 0;
    if (speed !== 0) {
      tapeF = clamp(tapeF - speed * TAPE_RATE * dt, TAPE_MIN, TAPE_MAX);
      if (tapeF <= TAPE_MIN + 0.0001 || tapeF >= TAPE_MAX - 0.0001) setMode("stopped");
    }
    const rL = 0.3 + tapeF * 0.4;
    const rR = 0.3 + (1 - tapeF) * 0.4;
    if (installed) {
      installed.reelL.spool.scale.set(rL / 0.7, rL / 0.7, 1);
      installed.reelR.spool.scale.set(rR / 0.7, rR / 0.7, 1);
      if (speed !== 0) {
        installed.reelL.group.rotation.z -= (speed / rL) * dt;
        installed.reelR.group.rotation.z -= (speed / rR) * dt;
      }
    }
  }

  return {
    root,
    pressables,
    press,
    update,
    install,
    remove,
    setDoorOpen,
    insertTarget,
    clickBlockers: [plate, lid, rod, tab],
    hooks,
    // public state the app drives on
    get installed() {
      return installed;
    },
    get tapeF() {
      return tapeF;
    },
    get doorOpen() {
      return doorOpen;
    },
    get busy() {
      return !!insertAnim;
    },
    get progress() {
      return (TAPE_MAX - tapeF) / (TAPE_MAX - TAPE_MIN);
    },
    debug: {
      get mode() {
        return mode;
      },
      get doorOpen() {
        return doorOpen;
      },
      get doorAngle() {
        return door.rotation.x;
      },
      get reelAngle() {
        return installed ? installed.reelL.group.rotation.z : 0;
      },
      get tapeF() {
        return tapeF;
      },
      get installed() {
        return installed;
      },
      get busy() {
        return !!insertAnim;
      },
      get volumeStep() {
        return volumeStep;
      },
    },
  };
}
