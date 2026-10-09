# airsoft-disassembly

Interactive exploded 3D models of airsoft guns, served at https://airsoft-disassembly.raviboth.com.

- One folder per gun (`kc02/`, `cm048m/`, `g19/`, `stoner96/`, `mk1/`, `mac10/`, `bar10/`, `ssx303/`, `mp5/`, `sten/`), plus `v2/` and `v3/` for the V2 and V3 AEG gearboxes on their own, each a single self-contained `index.html` with a `preview.png` for link cards.
- three.js r170 is vendored in `vendor/three/` (MIT, see its LICENSE), loaded through an import map. No build step.
- Shared feature geometry lives in `lib/`: `lib/picatinny.js` builds MIL-STD-1913 rails (the standard's cross-section, recoil grooves on the 10.01mm pitch) for any face of a gun, and `picMount` gives anything that sits on a rail (sights, grips, rail covers) a clamp base whose jaws hook under the rail flanks, with the cross bolt in a recoil groove. Pages import it with a relative path.
- Hosted on GitHub Pages from `main`; `CNAME` sets the custom domain.

Local preview: `python3 -m http.server` in the repo root, then open http://localhost:8000/.

## Reusing the V2 gearbox

The V2 is one of the most common AEG gearboxes (the M4/M16 and MP5 families and many more), so `v2/index.html` is meant to be reused: copy its gearbox section into another page or project, or take the part shapes and coordinates as a starting point. No permission needed; a link back is welcome. The shell is built from Siris Rui's public-domain 3D scan (Printables 778454).

`v3/index.html` does the same for the V3 (AK pattern) gearbox, in the same frame as the V2 page so the shared gears, piston and cylinder parts line up. Its shell is traced from Pedro Oliva's V3 reference CAD model on GrabCAD.
