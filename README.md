# Solar System — Interactive 3D Visualization

A browser-based 3D visualization of the solar system built with **React** + **Three.js**. Features accurate relative orbital speeds, zoom controls, and a clean UI.

## Tech Stack

| Layer      | Technology                                                          |
| ---------- | ------------------------------------------------------------------- |
| Framework  | [React](https://react.dev/) 18                                     |
| Rendering  | [Three.js](https://threejs.org/) r160 (WebGL)                     |
| Build tool | [Vite](https://vitejs.dev/) 5                                      |
| Controls   | OrbitControls (pan, zoom, rotate)                                   |
| Labels     | CSS2DRenderer (screen-space planet labels)                          |

## How to Run

```bash
npm install        # already done
npm run dev        # starts Vite dev server (usually http://localhost:5173)
```

Or for a production build:

```bash
npm run build      # outputs to dist/
npm run preview    # preview the build locally
```

## Controls

| Input               | Action               |
| ------------------- | -------------------- |
| Click + drag        | Orbit camera         |
| Scroll              | Zoom in / out        |
| Space               | Pause / resume       |
| **UI Buttons**      |                      |
| `+` / `−` (left)    | Zoom in / out        |
| `⟲`                 | Reset camera view    |
| `−` / `+` (speed)   | Slow down / speed up |
| `⏸` / `▶`          | Pause / resume       |
| `ℹ`                 | Info panel           |

## Project Structure

```
Solar System/
├── index.html              # Vite entry point
├── package.json            # Dependencies (react, three, vite)
├── vite.config.js          # Vite config with React plugin
├── .gitignore
├── src/
│   ├── main.jsx            # React DOM entry
│   ├── App.jsx             # Main app (wires Scene3D + ControlsBar + InfoPanel)
│   ├── components/
│   │   ├── Scene3D.jsx     # Three.js scene (forwardRef + useImperativeHandle)
│   │   ├── ControlsBar.jsx # Zoom, speed, pause, info buttons
│   │   └── InfoPanel.jsx   # Modal with planet orbital periods
│   ├── data/
│   │   └── planetData.js   # Planet config (name, distance, size, color, period, rings)
│   └── styles/
│       └── app.css         # Full-screen dark theme + UI styles
└── README.md
```

## How Orbits Work

Orbital periods (Earth days):

| Planet   | Period (days) | Rel. Speed |
| -------- | ------------- | ---------- |
| Mercury  | 87.97         | 4.15×      |
| Venus    | 224.70        | 1.62×      |
| Earth    | 365.25        | 1.00×      |
| Mars     | 687.00        | 0.53×      |
| Jupiter  | 4,332.60      | 0.08×      |
| Saturn   | 10,759.20     | 0.03×      |
| Uranus   | 30,688.50     | 0.01×      |
| Neptune  | 60,182.30     | 0.006×     |

Each planet's angular velocity is `ω = 2π / T`. The animation uses **relative speed ratios** (`ω_planet / ω_Earth`) so that in one Earth orbit, Mercury completes ~4.15 orbits and Neptune completes ~0.006 orbits.

Planetary distances and sizes are **visually scaled** (not to real scale) so all planets are visible. The relative ordering is correct.

## Key Implementation Details

- **`src/data/planetData.js`** — Planet configs (name, distance, size, color, orbital period, tilt, rings flag)
- **`src/components/Scene3D.jsx`** — Manages the full Three.js lifecycle inside a `useEffect` (setup → animate → cleanup). Exposes `zoomIn`, `zoomOut`, `resetView` via `useImperativeHandle`.
- **`speed` / `paused`** — React state passed as props to `Scene3D`, synced to refs for the animation loop
- **Sun glow** — Custom `ShaderMaterial` with Fresnel-style glow (back-side rendering, additive blending)
- **Saturn rings** — Procedural canvas texture with gradient opacity
- **Earth clouds** — Transparent white overlay sphere at 1.02× scale
- **Star field** — 12,000 stars on a sphere with randomized color temperatures

## Features

- 8 planets + Sun with glow and corona effect
- Saturn's rings with procedural texture
- Earth with cloud layer
- Orbit path lines
- Planet labels (CSS2D)
- Camera: orbit, pan, zoom with min/max limits
- Speed controls (0.1× to 10×)
- Pause / resume with Space key
- Responsive to window resize
- Tone-mapped rendering (ACES Filmic)

## Notes for Future Agents

### Adding a new planet
Add an entry to `PLANET_DATA` in `src/data/planetData.js`. The orbit line, label, and animation are handled automatically.

### Adding textures
Place texture images in a new `public/` directory (or keep in `src/`) and load with `THREE.TextureLoader()`.

### Known Limitations
- No asteroid belt or dwarf planets
- Axial tilts are defined but not visually applied
- No moons
- Circular orbits (no eccentricity)
- Artistic scale (real scale would hide outer planets)
