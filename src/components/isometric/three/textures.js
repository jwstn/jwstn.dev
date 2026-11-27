import * as THREE from "three";

function makeTexture(w, h, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d"), w, h);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function makeTinyLabel(text) {
  return makeTexture(256, 64, (ctx) => {
    ctx.clearRect(0, 0, 256, 64);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "4px";
    ctx.fillStyle = "#cfd5dc";
    ctx.font = '600 30px "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(text, 128, 32);
  });
}

export function makeKeyIcon(action) {
  return makeTexture(128, 128, (ctx) => {
    ctx.fillStyle = "#e8ecf1";
    const tri = (x, y, s, dir) => {
      ctx.beginPath();
      if (dir === 1) {
        ctx.moveTo(x, y - s);
        ctx.lineTo(x, y + s);
        ctx.lineTo(x + s * 1.5, y);
      } else if (dir === -1) {
        ctx.moveTo(x, y - s);
        ctx.lineTo(x, y + s);
        ctx.lineTo(x - s * 1.5, y);
      } else {
        ctx.moveTo(x - s, y + s * 0.7);
        ctx.lineTo(x + s, y + s * 0.7);
        ctx.lineTo(x, y - s);
      }
      ctx.closePath();
      ctx.fill();
    };
    switch (action) {
      case "play":
        tri(64, 64, 30, 1);
        break;
      case "rew":
        tri(46, 64, 26, -1);
        tri(86, 64, 26, -1);
        break;
      case "ff":
        tri(46, 64, 26, 1);
        tri(86, 64, 26, 1);
        break;
      case "stop":
        ctx.fillRect(40, 40, 48, 48);
        break;
      case "pause":
        ctx.fillRect(44, 38, 14, 52);
        ctx.fillRect(70, 38, 14, 52);
        break;
      case "eject":
        tri(64, 54, 26, 0);
        ctx.fillRect(38, 90, 52, 12);
        break;
    }
  });
}

export function makeWalkmanBadge() {
  return makeTexture(512, 160, (ctx) => {
    ctx.clearRect(0, 0, 512, 160);
    ctx.fillStyle = "#10151f";
    ctx.beginPath();
    ctx.moveTo(22, 4);
    ctx.lineTo(490, 4);
    ctx.quadraticCurveTo(508, 4, 508, 22);
    ctx.lineTo(508, 138);
    ctx.quadraticCurveTo(508, 156, 490, 156);
    ctx.lineTo(22, 156);
    ctx.quadraticCurveTo(4, 156, 4, 138);
    ctx.lineTo(4, 22);
    ctx.quadraticCurveTo(4, 4, 22, 4);
    ctx.fill();
    ctx.strokeStyle = "#31405a";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ff5a1f";
    ctx.font = "italic 700 62px Georgia, serif";
    ctx.fillText("three.js", 36, 82);

    ctx.textAlign = "right";
    ctx.fillStyle = "#dfe5ec";
    ctx.font = '700 27px "DejaVu Sans", Arial, sans-serif';
    ctx.fillText("PERSONAL STEREO", 476, 58);
    ctx.fillStyle = "#8f9aa8";
    ctx.font = '600 24px "DejaVu Sans", Arial, sans-serif';
    ctx.fillText("WM-1 · STEREO CASSETTE", 476, 104);
  });
}

export function makeSpineLabel(title, accent) {
  return makeTexture(96, 512, (ctx) => {
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 96, 512);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(0, 0, 96, 26);
    ctx.fillRect(0, 486, 96, 26);
    // title reads top-to-bottom along the spine
    ctx.save();
    ctx.translate(48, 256);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = "#f5f1e4";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '600 30px "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(title, 0, 0);
    ctx.restore();
  });
}

export function makeCassetteLabel(title = "summer drive mix · 1986", accent = "#c8402c") {
  return makeTexture(1024, 132, (ctx) => {
    ctx.fillStyle = "#ece4d0";
    ctx.fillRect(0, 0, 1024, 132);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 1024, 10);
    ctx.fillRect(0, 122, 1024, 10);
    ctx.fillRect(0, 0, 10, 132);
    ctx.fillRect(1014, 0, 10, 132);
    ctx.fillRect(28, 22, 148, 88);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '700 26px "DejaVu Sans", Arial, sans-serif';
    ctx.fillText("SIDE", 102, 46);
    ctx.font = '700 46px "DejaVu Sans", Arial, sans-serif';
    ctx.fillText("A", 102, 86);

    ctx.textAlign = "left";
    ctx.fillStyle = "#2e2c26";
    ctx.font = "italic 600 44px Georgia, serif";
    ctx.fillText(title, 212, 62);

    ctx.strokeStyle = "#b4ab97";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(212, 100);
    ctx.lineTo(996, 100);
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.fillStyle = "#8f897a";
    ctx.font = '700 26px "DejaVu Sans", Arial, sans-serif';
    ctx.fillText("C-90", 996, 44);
  });
}

export function makeCassetteStrip() {
  return makeTexture(1024, 76, (ctx) => {
    ctx.fillStyle = "#e6ddc6";
    ctx.fillRect(0, 0, 1024, 76);
    ctx.fillStyle = "#c8402c";
    ctx.fillRect(0, 0, 1024, 6);
    ctx.fillRect(0, 70, 1024, 6);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#8f897a";
    ctx.letterSpacing = "3px";
    ctx.font = '600 24px "DejaVu Sans", Arial, sans-serif';
    ctx.fillText("NORMAL BIAS · TYPE I EQ · 45 MIN", 512, 40);
  });
}

export function makeGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(512, 512, 60, 512, 512, 700);
  g.addColorStop(0, "#2a3038");
  g.addColorStop(0.6, "#1d222a");
  g.addColorStop(1, "#15181e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 1024);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
