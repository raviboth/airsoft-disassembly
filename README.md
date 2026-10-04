# airsoft-disassembly

Interactive exploded 3D models of airsoft guns, served at https://airsoft-disassembly.raviboth.com.

- One folder per gun (`kc02/`, `cm048m/`, `g19/`, `stoner96/`), each a single self-contained `index.html` with a `preview.png` for link cards.
- three.js r170 is vendored in `vendor/three/` (MIT, see its LICENSE), loaded through an import map. No build step.
- Shared feature geometry lives in `lib/`: `lib/picatinny.js` builds MIL-STD-1913 rails (the standard's cross-section, recoil grooves on the 10.01mm pitch) for any face of a gun. Pages import it with a relative path.
- Hosted on GitHub Pages from `main`; `CNAME` sets the custom domain.

Local preview: `python3 -m http.server` in the repo root, then open http://localhost:8000/.
