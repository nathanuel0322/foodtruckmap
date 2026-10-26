# foodtruckmap

Vite + React + TypeScript app (mapbox-gl, react-map-gl). Scripts: `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm test`.

## Dependency notes
- `package.json` `overrides` pins `esbuild` to `^0.25.0` to fix GHSA-67mh-4wv8-2f99 (Vite 5 bundles esbuild 0.21.x). Keep it until Vite is upgraded to a version that depends on a patched esbuild.
- Remaining `npm audit` findings for `vite <=6.4.2` need a breaking upgrade to Vite 8; deferred.
