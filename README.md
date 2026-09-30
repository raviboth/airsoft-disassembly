# airsoft-disassembly

Interactive exploded 3D models of airsoft guns, served at https://airsoft-disassembly.raviboth.com.

- One folder per gun (`kc02/`), each a single self-contained `index.html` with a `preview.png` for link cards.
- three.js r170 is vendored in `vendor/three/` (MIT, see its LICENSE), loaded through an import map. No build step.
- Hosted on GitHub Pages from `main`; `CNAME` sets the custom domain.

Local preview: `python3 -m http.server` in the repo root, then open http://localhost:8000/.
