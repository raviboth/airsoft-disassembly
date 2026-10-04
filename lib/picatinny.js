// MIL-STD-1913 (Picatinny) rail, shared by every gun page.
//
// Cross-section from the standard's drawing (reproduced on Wikipedia as M1913A_Rail_CrossSection.svg), in inches:
// .835 overall width, 45 degree flanks top and bottom, .617 neck, .367 min height, .164 from the top to the gauge
// line. Recoil grooves (figure 2 of the standard): .206 wide, .118 deep, .394 centre to centre. Checked against a
// MIL-STD-1913 rail model from Printables (21.2mm wide, 15.67mm neck, 9.32mm tall, 3mm grooves on a 10mm pitch).
//
// Units are mm. x runs along the rail; the rail stands on a face of the gun at distance `off` from the gun's axis.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const PIC = {
  width: 21.21,      // .835 overall
  top: 18.16,        // flat top, .835 less the two .06 top chamfers
  neck: 15.67,       // .617 between the undercuts
  height: 9.32,      // .367, foot of the neck to the top
  slot: 5.23,        // .206 recoil groove width
  slotDepth: 3.0,    // .118
  pitch: 10.01,      // .394 groove centre to centre
};

// half-widths at heights above the foot of the neck
const W = PIC.width / 2, T = PIC.top / 2, N = PIC.neck / 2, H = PIC.height;
const H_TOP_CHAMFER = H - 1.52;            // the .06 top chamfer ends here
const H_WIDE = H - 3.43;                   // widest flat starts .135 below the top
const H_NECK = H_WIDE - (W - N);           // the 45 degree undercut runs in to the neck
const H_FLOOR = H - PIC.slotDepth;         // groove floor

const shape = pts => new THREE.Shape(pts.map(([w, h]) => new THREE.Vector2(w, h)));
// prism of a (w, h) section along x from a to b
function prism(pts, a, b) {
  const g = new THREE.ExtrudeGeometry(shape(pts), { depth: b - a, bevelEnabled: false, curveSegments: 1 });
  g.rotateY(Math.PI / 2);                  // extrusion runs along +x, section w lands on -z (the section is symmetric)
  g.translate(a, 0, 0);
  return g;
}

// Rail from x0 to x1 on `face` ('up' | 'down' | 'left' | 'right'), its neck foot at `off` from the axis.
//   yc     centre height of a side rail
//   riser  solid pedestal from the foot of the neck down toward the axis (off - riser to off), for a rail that
//          stands proud of a curved or recessed surface. It does not raise the rail: move off for that
//   riserW pedestal half width (defaults to the neck)
// Grooves are centred along the length with a full tooth at each end. Returns one merged geometry.
export function picatinny(x0, x1, face = 'up', off = 0, { yc = 0, riser = 0, riserW = N } = {}) {
  const L = x1 - x0, g = PIC.slot, p = PIC.pitch;
  const body = [[-N, H_NECK], [-N, 0], [N, 0], [N, H_NECK], [W, H_WIDE], [W, H_FLOOR], [-W, H_FLOOR], [-W, H_WIDE]];
  const tooth = [[-W, H_FLOOR], [W, H_FLOOR], [W, H_TOP_CHAMFER], [T, H], [-T, H], [-W, H_TOP_CHAMFER]];
  const geos = [prism(body, x0, x1)];
  if (riser > 0) geos.push(prism([[-riserW, 0], [-riserW, -riser], [riserW, -riser], [riserW, 0]], x0, x1));
  const n = Math.max(0, Math.floor((L - g - 3) / p) + 1);   // keep at least 1.5mm of tooth at each end
  const s0 = x0 + (L - ((n - 1) * p + g)) / 2;
  let a = x0;
  for (let i = 0; i < n; i++) { const s = s0 + i * p; if (s > a) geos.push(prism(tooth, a, s)); a = s + g; }
  if (x1 > a) geos.push(prism(tooth, a, x1));
  const out = mergeGeometries(geos.map(q => q.index ? q.toNonIndexed() : q));
  out.translate(0, off, 0);
  if (face === 'down') out.rotateX(Math.PI);
  if (face === 'right') out.rotateX(Math.PI / 2);
  if (face === 'left') out.rotateX(-Math.PI / 2);
  if (face === 'left' || face === 'right') out.translate(0, yc, 0);
  return out;
}
