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

// stand a geometry built in the rail's own frame (h up from the foot of the neck, w across) on a face of the gun
function place(g, face, off, yc) {
  g.translate(0, off, 0);
  if (face === 'down') g.rotateX(Math.PI);
  if (face === 'right') g.rotateX(Math.PI / 2);
  if (face === 'left') g.rotateX(-Math.PI / 2);
  if (face === 'left' || face === 'right') g.translate(0, yc, 0);
  return g;
}
const merge = geos => mergeGeometries(geos.map(q => q.index ? q.toNonIndexed() : q));

// recoil groove centres of a rail from x0 to x1: centred along the length with at least 1.5mm of tooth at each end
export function picatinnySlots(x0, x1) {
  const L = x1 - x0, g = PIC.slot, p = PIC.pitch, n = Math.max(0, Math.floor((L - g - 3) / p) + 1);
  const c0 = x0 + (L - (n - 1) * p) / 2;
  return Array.from({ length: n }, (_, i) => c0 + i * p);
}

// Rail from x0 to x1 on `face` ('up' | 'down' | 'left' | 'right'), its neck foot at `off` from the axis.
//   yc     centre height of a side rail
//   riser  solid pedestal from the foot of the neck down toward the axis (off - riser to off), for a rail that
//          stands proud of a curved or recessed surface. It does not raise the rail: move off for that
//   riserW pedestal half width (defaults to the neck)
// Returns one merged geometry.
export function picatinny(x0, x1, face = 'up', off = 0, { yc = 0, riser = 0, riserW = N } = {}) {
  const body = [[-N, H_NECK], [-N, 0], [N, 0], [N, H_NECK], [W, H_WIDE], [W, H_FLOOR], [-W, H_FLOOR], [-W, H_WIDE]];
  const tooth = [[-W, H_FLOOR], [W, H_FLOOR], [W, H_TOP_CHAMFER], [T, H], [-T, H], [-W, H_TOP_CHAMFER]];
  const geos = [prism(body, x0, x1)];
  if (riser > 0) geos.push(prism([[-riserW, 0], [-riserW, -riser], [riserW, -riser], [riserW, 0]], x0, x1));
  let a = x0;
  for (const c of picatinnySlots(x0, x1)) { const s = c - PIC.slot / 2; if (s > a) geos.push(prism(tooth, a, s)); a = s + PIC.slot; }
  if (x1 > a) geos.push(prism(tooth, a, x1));
  return place(merge(geos), face, off, yc);
}

// Clamp base for anything that mounts on a rail (sights, grips, optics, rail covers), from xa to xb along it.
// `rail` is { x0, x1, face, off, yc } as passed to picatinny(). The base wraps over the rail top and its jaws hook
// under the 45 degree flanks, 0.3mm clear of the rail. A cross bolt (the recoil lug) runs through the base in the
// recoil groove nearest `boltAt`: a hex or socket-cap head on the right (+z on an 'up' rail) and a nut on the left,
// or a thumb knob in place of the head.
//   hw    half width of the base (default 2.2mm wider than the rail each side)
//   t     thickness of the base above the rail top
//   bolt  'hex' | 'socket' | 'knob' | false (rail covers have no bolt)
// Returns { body, bolt }: bolt is null when there is none, or no groove under the base.
export function picMount(rail, xa, xb, { hw = W + 2.2, t = 4, bolt = 'hex', boltAt = (xa + xb) / 2 } = {}) {
  const { face = 'up', off = 0, yc = 0 } = rail, c = 0.3, Hj = H_NECK + c, top = H + t;
  const half = [[hw, top], [hw, Hj], [N + 2 * c, Hj], [W + c, H_WIDE], [W + c, H + c]];
  const body = place(prism([[-hw, top], ...half.slice(1).map(([w, h]) => [-w, h]), ...half.slice(1).reverse(), [hw, top]], xa, xb), face, off, yc);
  const slots = picatinnySlots(rail.x0, rail.x1).filter(x => x - PIC.slot / 2 >= xa + 1 && x + PIC.slot / 2 <= xb - 1);
  if (!bolt || !slots.length) return { body, bolt: null };
  const x = slots.reduce((m, v) => Math.abs(v - boltAt) < Math.abs(m - boltAt) ? v : m), hb = (H_FLOOR + H + c) / 2;
  const rod = (r, a, b, seg) => { const g = new THREE.CylinderGeometry(r, r, b - a, seg); g.rotateX(Math.PI / 2); g.translate(x, hb, (a + b) / 2); return g; };
  const parts = [rod(1.5, -hw - 3.5, bolt === 'socket' ? hw + 1 : hw + 3.5, 12), rod(3.2, -hw - 3, -hw, 6)];   // shank, nut
  if (bolt === 'knob') parts.push(rod(6, hw, hw + 4.5, 24), rod(4.5, hw + 4.5, hw + 6, 24));
  else if (bolt === 'socket') {   // cap head with a hex socket
    const sh = new THREE.Shape().absarc(0, 0, 3, 0, Math.PI * 2, false), hole = new THREE.Path();
    for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI * 2; i ? hole.lineTo(1.4 * Math.cos(a), 1.4 * Math.sin(a)) : hole.moveTo(1.4, 0); }
    sh.holes.push(hole);
    const head = new THREE.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 1, curveSegments: 20 });
    head.translate(x, hb, hw);
    parts.push(head);
  } else parts.push(rod(3.2, hw, hw + 2.6, 6));
  return { body, bolt: place(merge(parts), face, off, yc) };
}
