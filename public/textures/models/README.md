# Official NASA 3D models (optimised)

| File | Original (NASA Science) | Processing | Size |
|---|---|---|---|
| `iss-nasa.glb` | `assets.science.nasa.gov/.../ISS_stationary.glb` (44.5 MB, 2023-09-09) | gltf-transform: meshopt + WebP textures @1024 | 4.8 MB |
| `perseverance-nasa.glb` | `assets.science.nasa.gov/.../25042_Perseverance.glb` (11.7 MB, 2024-03-08) | same | 2.3 MB |

Fidelity: **Official NASA 3D models** (repackaged, geometry unchanged). Both load
lazily via `useGLTF` with the in-bundle MeshoptDecoder — no CDN dependency.
Full provenance: `public/textures/PROVENANCE.md`.
