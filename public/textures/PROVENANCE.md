# Asset provenance — planet textures & official NASA 3D models

Every asset below is a genuine NASA or NASA-derived artifact, downloaded and
processed deterministically on 2026-11-09. Nothing here is AI-generated or
invented. Originals re-downloadable from the listed URLs at any time.

## Planet / Earth textures (`public/textures/planets/`)

| File | Source | Notes |
|---|---|---|
| `earth_atmos_2048.jpg` | three.js examples (`raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg`) | NASA Blue Marble day map, 2048×1024 |
| `earth_normal_2048.jpg` | same | derived normal map |
| `earth_specular_2048.jpg` | same | ocean mask |
| `earth_lights_2048.png` | same | NASA Earth-at-night city lights |
| `earth_clouds_1024.png` | same | cloud alpha map |
| `moon_1024.jpg` | same | NASA Clementine/LRO-derived moon map |
| `mars_2k.jpg` | solarsystemscope.com/textures (CC BY 4.0), Mars global colour mosaic from NASA imagery | 2048×1024 |

three.js example textures are NASA imagery redistributions (see
https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets).

## Official NASA 3D models (`public/textures/models/`)

| File | Original | Processing | Fidelity label |
|---|---|---|---|
| `iss-nasa.glb` (3.3 MB) | `https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/i/ISS_stationary.glb` (44.5 MB, NASA Science, Sep 9 2023) | `@gltf-transform/cli optimize --compress draco --texture-compress webp --texture-size 1024` (geometry untouched) | **Official NASA 3D model** (optimised) |
| `perseverance-nasa.glb` (1.6 MB) | `https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/gltf_files/25042_Perseverance.glb` (11.7 MB, NASA Science, Mar 8 2024) | same | **Official NASA 3D model** (optimised) |

Both are loaded lazily (never on first paint). The optimisation step is a
repackaging, not a re-modelling — geometry counts are unchanged, textures are
capped at 1024 px.

## Fallback imagery

If WebGL is unavailable, the mission map degrades to the four environment
photographs in `public/media/environments/` (team-supplied concept
illustrations, each labelled as such in the UI) — never to invented renders.
