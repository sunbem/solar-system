import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { PLANET_DATA, EARTH_PERIOD } from '../data/planetData';

const Scene3D = forwardRef(({ speed, paused, moonsVisible }, ref) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const sunGroupRef = useRef(null);
  const planetsRef = useRef([]);
  const rendererRef = useRef(null);
  const labelRendererRef = useRef(null);
  const animIdRef = useRef(null);
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);
  const moonsRef = useRef([]);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => {
    moonsRef.current.forEach(({ moon, orbitLine }) => {
      moon.visible = moonsVisible;
      orbitLine.visible = moonsVisible;
      moon.children.forEach((child) => {
        if (child.element) child.visible = moonsVisible;
      });
    });
  }, [moonsVisible]);

  useImperativeHandle(ref, () => ({
    zoomIn() {
      const dir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(dir);
      cameraRef.current.position.addScaledVector(dir, 3);
      controlsRef.current.update();
    },
    zoomOut() {
      const dir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(dir);
      cameraRef.current.position.addScaledVector(dir, -3);
      controlsRef.current.update();
    },
    resetView() {
      cameraRef.current.position.set(10, 20, 35);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 2000);
    camera.position.set(10, 20, 35);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(w, h);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 200;
    controls.target.set(0, 0, 0);
    controls.addEventListener('start', () => { container.style.cursor = 'grabbing'; });
    controls.addEventListener('end', () => { container.style.cursor = 'grab'; });
    container.style.cursor = 'grab';
    controlsRef.current = controls;

    const starCount = 12000;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 300 + Math.random() * 700;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = radius * Math.cos(phi);
      const t = Math.random();
      if (t < 0.3) {
        starColors[i * 3] = 0.8 + Math.random() * 0.2;
        starColors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
        starColors[i * 3 + 2] = 0.6 + Math.random() * 0.4;
      } else if (t < 0.6) {
        starColors[i * 3] = 0.9 + Math.random() * 0.1;
        starColors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        starColors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else {
        starColors[i * 3] = 0.6 + Math.random() * 0.2;
        starColors[i * 3 + 1] = 0.6 + Math.random() * 0.2;
        starColors[i * 3 + 2] = 1.0;
      }
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    function generateTexture(name) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;

      function noise(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return n - Math.floor(n);
      }

      function smoothNoise(x, y) {
        const ix = Math.floor(x), iy = Math.floor(y);
        const fx = x - ix, fy = y - iy;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const n00 = noise(ix, iy), n10 = noise(ix + 1, iy);
        const n01 = noise(ix, iy + 1), n11 = noise(ix + 1, iy + 1);
        return n00 * (1 - sx) * (1 - sy) + n10 * sx * (1 - sy) + n01 * (1 - sx) * sy + n11 * sx * sy;
      }

      function fbm(x, y, octaves) {
        let value = 0, amp = 1, freq = 1;
        for (let i = 0; i < octaves; i++) { value += amp * smoothNoise(x * freq, y * freq); amp *= 0.5; freq *= 2; }
        return value;
      }

      const imgData = ctx.createImageData(w, h);
      const d = imgData.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / w, v = y / h;
          const px = u * 8, py = v * 8;
          const idx = (y * w + x) * 4;
          let r, g, b;

          switch (name) {
            case 'Sun': {
              const n = fbm(px * 4, py * 4, 7);
              const spots = Math.max(0, 1 - Math.abs(fbm(px * 6 + 3.7, py * 6 + 1.3, 4) - 0.4) * 5);
              const bright = fbm(px * 2 + 1.5, py * 2 + 2.3, 3);
              r = 200 + n * 55 - spots * 60 + bright * 30;
              g = 100 + n * 50 - spots * 40 + bright * 20;
              b = 20 + n * 25 - spots * 20;
              break;
            }
            case 'Mercury': {
              const n = fbm(px * 2, py * 2, 6);
              const crater = Math.pow(Math.min(1, Math.abs(noise(px * 5, py * 5) - 0.5) * 8), 1.5);
              r = 120 + n * 40 - crater * 30;
              g = 105 + n * 35 - crater * 25;
              b = 90 + n * 30 - crater * 20;
              break;
            }
            case 'Venus': {
              const n1 = fbm(px * 1.5, py * 1.5, 5);
              const swirl = fbm(px * 3 + n1 * 0.5, py * 3, 4);
              r = 200 + swirl * 40;
              g = 170 + swirl * 30;
              b = 120 + swirl * 20;
              break;
            }
            case 'Earth': {
              const land = fbm(px * 1.2, py * 1.2, 6);
              const threshold = 0.45;
              if (land > threshold) {
                const hgt = (land - threshold) / (1 - threshold);
                r = 40 + hgt * 80;
                g = 100 + hgt * 60 + (1 - hgt) * 40;
                b = 30 + hgt * 20;
                if (hgt > 0.6) { r += (hgt - 0.6) * 150; g += (hgt - 0.6) * 120; b += (hgt - 0.6) * 60; }
              } else {
                const depth = 1 - land / threshold;
                r = 20 + (1 - depth) * 20;
                g = 60 + (1 - depth) * 40;
                b = 120 + (1 - depth) * 60;
              }
              break;
            }
            case 'Mars': {
              const n2 = fbm(px * 2, py * 2, 6);
              r = 160 + n2 * 50 - (1 - n2) * 30;
              g = 80 + n2 * 40;
              b = 40 + n2 * 20;
              break;
            }
            case 'Jupiter': {
              const band = Math.sin(v * 30 + fbm(px * 0.5, v * 2, 3) * 2) * 0.5 + 0.5;
              const turb = fbm(px * 0.3, py * 0.3, 3) * 0.3;
              r = 180 + band * 60 + turb * 40;
              g = 140 + band * 40 + turb * 30;
              b = 90 + band * 30 + turb * 20;
              break;
            }
            case 'Saturn': {
              const band2 = Math.sin(v * 25 + fbm(px * 0.3, v * 2, 2) * 1.5) * 0.5 + 0.5;
              r = 200 + band2 * 40;
              g = 180 + band2 * 30;
              b = 150 + band2 * 20;
              break;
            }
            case 'Uranus': {
              const n3 = fbm(px * 1.5, py * 1.5, 4);
              r = 120 + n3 * 30;
              g = 170 + n3 * 20;
              b = 200 + n3 * 30;
              break;
            }
            case 'Neptune': {
              const n4 = fbm(px * 2, py * 2, 5);
              r = 40 + n4 * 30;
              g = 60 + n4 * 40;
              b = 140 + n4 * 60;
              break;
            }
            default: {
              r = 128; g = 128; b = 128;
            }
          }
          d[idx] = Math.max(0, Math.min(255, r));
          d[idx + 1] = Math.max(0, Math.min(255, g));
          d[idx + 2] = Math.max(0, Math.min(255, b));
          d[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return new THREE.CanvasTexture(canvas);
    }

    const sunGroup = new THREE.Group();
    scene.add(sunGroup);
    sunGroupRef.current = sunGroup;

    const sunGeo = new THREE.SphereGeometry(2.8, 64, 64);
    const sunMat = new THREE.MeshStandardMaterial({
      map: generateTexture('Sun'),
      color: 0xffaa00,
      emissive: 0xff6600,
      emissiveIntensity: 0.6,
      roughness: 0.4,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    const sunLabelDiv = document.createElement('div');
    sunLabelDiv.textContent = 'Sun';
    sunLabelDiv.style.color = '#ffaa00';
    sunLabelDiv.style.fontFamily = 'Segoe UI, Arial, sans-serif';
    sunLabelDiv.style.fontSize = '14px';
    sunLabelDiv.style.fontWeight = '600';
    sunLabelDiv.style.textShadow = '0 0 12px rgba(255,170,0,0.8), 0 0 4px rgba(0,0,0,1)';
    sunLabelDiv.style.letterSpacing = '2px';
    sunLabelDiv.style.pointerEvents = 'none';
    sunLabelDiv.style.userSelect = 'none';
    const sunLabel = new CSS2DObject(sunLabelDiv);
    sunLabel.position.set(0, 3.8, 0);
    sunGroup.add(sunLabel);

    const sunLight = new THREE.PointLight(0xffffff, 5.0, 300);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x446688, 1.0);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x8888ff, 0.5);
    rimLight.position.set(-10, 20, -10);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffaa66, 0.4);
    fillLight.position.set(10, -5, 10);
    scene.add(fillLight);

    const planets = [];

    PLANET_DATA.forEach((data) => {
      const points = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
          data.distance * Math.cos(angle), 0, data.distance * Math.sin(angle)
        ));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMat = new THREE.LineBasicMaterial({ color: 0x8899cc, transparent: true, opacity: 0.6 });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      scene.add(orbitLine);

      const planetGeo = new THREE.SphereGeometry(data.size, 48, 48);

      let planetMat;
      const commonProps = { roughness: 0.5, metalness: 0.1 };
      if (data.name === 'Earth') {
        planetMat = new THREE.MeshStandardMaterial({
          map: generateTexture('Earth'), roughness: 0.4, metalness: 0.05,
          emissive: 0x2244aa, emissiveIntensity: 0.05,
        });
      } else if (data.name === 'Saturn') {
        planetMat = new THREE.MeshStandardMaterial({ map: generateTexture('Saturn'), ...commonProps, color: data.color, roughness: 0.6, metalness: 0.1 });
      } else if (data.name === 'Jupiter') {
        planetMat = new THREE.MeshStandardMaterial({ map: generateTexture('Jupiter'), ...commonProps, color: data.color, roughness: 0.7, metalness: 0.0 });
      } else if (data.name === 'Venus') {
        planetMat = new THREE.MeshStandardMaterial({ map: generateTexture('Venus'), ...commonProps, color: data.color, roughness: 0.8, metalness: 0.0 });
      } else {
        planetMat = new THREE.MeshStandardMaterial({ map: generateTexture(data.name), ...commonProps, color: data.color });
      }

      const planet = new THREE.Mesh(planetGeo, planetMat);
      planet.position.x = data.distance;

      if (data.name === 'Earth') {
        const cloudsGeo = new THREE.SphereGeometry(data.size * 1.02, 48, 48);
        const cloudsMat = new THREE.MeshStandardMaterial({
          color: 0xffffff, transparent: true, opacity: 0.15, roughness: 0.9,
        });
        const clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
        planet.add(clouds);
      }

      function addMoon(orbitRadius, size, color, speed, name) {
        const pts = [];
        for (let i = 0; i <= 64; i++) {
          const a = (i / 64) * Math.PI * 2;
          pts.push(new THREE.Vector3(orbitRadius * Math.cos(a), 0, orbitRadius * Math.sin(a)));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0x8899cc, transparent: true, opacity: 0.2 });
        const orbitLine = new THREE.Line(orbitGeo, orbitMat);
        scene.add(orbitLine);

        const meshGeo = new THREE.SphereGeometry(size, 24, 24);
        const meshMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
        const mesh = new THREE.Mesh(meshGeo, meshMat);
        mesh.position.x = orbitRadius;
        scene.add(mesh);

        const labelDiv = document.createElement('div');
        labelDiv.textContent = name;
        labelDiv.style.color = '#fff';
        labelDiv.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        labelDiv.style.fontSize = '10px';
        labelDiv.style.fontWeight = '400';
        labelDiv.style.textShadow = '0 0 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)';
        labelDiv.style.letterSpacing = '0.5px';
        labelDiv.style.pointerEvents = 'none';
        labelDiv.style.userSelect = 'none';
        const label = new CSS2DObject(labelDiv);
        label.position.set(0, size + 0.3, 0);
        mesh.add(label);

        return { mesh, orbitLine, angle: Math.random() * Math.PI * 2, radius: orbitRadius, speed };
      }

      const moons = [];
      if (data.name === 'Earth') {
        moons.push(addMoon(1.5, 0.2, 0xcccccc, 5.0, 'Moon'));
      }
      if (data.name === 'Mars') {
        moons.push(addMoon(1.0, 0.12, 0xbbaa99, 8.0, 'Phobos'));
        moons.push(addMoon(1.6, 0.1, 0x998877, 4.0, 'Deimos'));
      }
      if (data.name === 'Jupiter') {
        moons.push(addMoon(2.8, 0.25, 0xccbb88, 3.5, 'Io'));
        moons.push(addMoon(4.0, 0.22, 0x88aacc, 2.0, 'Europa'));
      }
      if (data.name === 'Saturn') {
        moons.push(addMoon(2.5, 0.3, 0xddcc88, 2.5, 'Titan'));
        moons.push(addMoon(1.8, 0.15, 0x99bbcc, 4.0, 'Enceladus'));
      }
      if (data.name === 'Uranus') {
        moons.push(addMoon(2.0, 0.16, 0x8899aa, 3.0, 'Miranda'));
        moons.push(addMoon(2.8, 0.18, 0xaabbcc, 2.0, 'Ariel'));
      }
      if (data.name === 'Neptune') {
        moons.push(addMoon(2.2, 0.2, 0x7799bb, 2.5, 'Triton'));
        moons.push(addMoon(3.0, 0.12, 0x889999, 1.5, 'Nereid'));
      }
      if (moons.length > 0) {
        moons.forEach((m) => moonsRef.current.push({ moon: m.mesh, orbitLine: m.orbitLine }));
        planet.userData.moons = moons;
      }

      if (data.rings) {
        const innerR = data.size * 1.3;
        const outerR = data.size * 2.3;
        const ringGeo = new THREE.RingGeometry(innerR, outerR, 96);

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 512, 0);
        grad.addColorStop(0, 'rgba(180,160,130,0.0)');
        grad.addColorStop(0.1, 'rgba(200,180,150,0.6)');
        grad.addColorStop(0.2, 'rgba(180,160,130,0.3)');
        grad.addColorStop(0.35, 'rgba(210,190,160,0.8)');
        grad.addColorStop(0.5, 'rgba(160,140,110,0.4)');
        grad.addColorStop(0.7, 'rgba(200,180,150,0.7)');
        grad.addColorStop(0.85, 'rgba(180,160,130,0.3)');
        grad.addColorStop(1, 'rgba(150,130,100,0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 64);

        const ringTex = new THREE.CanvasTexture(canvas);
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex, side: THREE.DoubleSide, transparent: true,
          depthWrite: false, roughness: 0.8, metalness: 0.1,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.2;
        ring.rotation.z = 0.2;
        planet.add(ring);
      }

      scene.add(planet);

      const labelDiv = document.createElement('div');
      labelDiv.textContent = data.name;
      labelDiv.style.color = '#fff';
      labelDiv.style.fontFamily = 'Segoe UI, Arial, sans-serif';
      labelDiv.style.fontSize = '13px';
      labelDiv.style.fontWeight = '500';
      labelDiv.style.textShadow = '0 0 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)';
      labelDiv.style.letterSpacing = '1px';
      labelDiv.style.pointerEvents = 'none';
      labelDiv.style.userSelect = 'none';
      const label = new CSS2DObject(labelDiv);
      label.position.set(0, data.size + 0.6, 0);
      planet.add(label);

      planets.push({
        mesh: planet,
        data,
        angle: Math.random() * Math.PI * 2,
        speed: EARTH_PERIOD / data.period,
      });
    });

    planetsRef.current = planets;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredObject = null;

    const origSunEmissive = sunMat.emissive.getHex();
    const origSunEmissiveIntensity = sunMat.emissiveIntensity;
    const hoverable = [sunMesh, ...planets.map((p) => p.mesh)];
    planets.forEach((p) => {
      const mat = p.mesh.material;
      p._origEmissive = mat.emissive ? mat.emissive.getHex() : 0x000000;
      p._origEmissiveIntensity = mat.emissiveIntensity || 0;
    });

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hoverable, true);

      if (hits.length > 0) {
        let hit = hits[0].object;
        while (hit.parent && !hoverable.includes(hit)) hit = hit.parent;
        if (!hoverable.includes(hit)) hit = null;

        if (hit === sunMesh) {
          if (hoveredObject !== sunMesh) {
            if (hoveredObject && hoveredObject !== sunMesh) {
              const hm = hoveredObject.material;
              const entry = planets.find((p) => p.mesh === hoveredObject);
              if (entry) {
                hm.emissive.setHex(entry._origEmissive);
                hm.emissiveIntensity = entry._origEmissiveIntensity;
              }
            } else if (hoveredObject === sunMesh) {
              sunMat.emissive.setHex(origSunEmissive);
              sunMat.emissiveIntensity = origSunEmissiveIntensity;
            }
            hoveredObject = sunMesh;
            sunMat.emissive.setHex(0xffffff);
            sunMat.emissiveIntensity = 1.5;
          }
        } else {
          const entry = hit ? planets.find((p) => p.mesh === hit) : null;
          if (entry && hoveredObject !== entry.mesh) {
            if (hoveredObject === sunMesh) {
              sunMat.emissive.setHex(origSunEmissive);
              sunMat.emissiveIntensity = origSunEmissiveIntensity;
            } else if (hoveredObject) {
              const prev = planets.find((p) => p.mesh === hoveredObject);
              if (prev) {
                const hm = prev.mesh.material;
                hm.emissive.setHex(prev._origEmissive);
                hm.emissiveIntensity = prev._origEmissiveIntensity;
              }
            }
            hoveredObject = entry.mesh;
            const hm = entry.mesh.material;
            hm.emissive.setHex(0xffffff);
            hm.emissiveIntensity = 0.5;
          }
        }
      } else if (hoveredObject) {
        if (hoveredObject === sunMesh) {
          sunMat.emissive.setHex(origSunEmissive);
          sunMat.emissiveIntensity = origSunEmissiveIntensity;
        } else {
          const entry = planets.find((p) => p.mesh === hoveredObject);
          if (entry) {
            const hm = entry.mesh.material;
            hm.emissive.setHex(entry._origEmissive);
            hm.emissiveIntensity = entry._origEmissiveIntensity;
          }
        }
        hoveredObject = null;
      }
    };
    container.addEventListener('pointermove', onPointerMove);

    let focusedPlanet = null;
    let savedCamPos = new THREE.Vector3();
    let savedTarget = new THREE.Vector3();
    let focusTransition = 0;

    function resetHoverGlow() {
      if (hoveredObject === sunMesh) {
        sunMat.emissive.setHex(origSunEmissive);
        sunMat.emissiveIntensity = origSunEmissiveIntensity;
      } else if (hoveredObject) {
        const entry = planets.find((p) => p.mesh === hoveredObject);
        if (entry) {
          entry.mesh.material.emissive.setHex(entry._origEmissive);
          entry.mesh.material.emissiveIntensity = entry._origEmissiveIntensity;
        }
      }
      hoveredObject = null;
    }

    function focusOn(entry) {
      resetHoverGlow();
      focusedPlanet = entry;
      savedCamPos.copy(camera.position);
      savedTarget.copy(controls.target);
      focusTransition = 0;
    }

    function unfocus() {
      if (focusedPlanet) {
        savedCamPos.copy(camera.position);
        savedTarget.copy(controls.target);
      }
      focusedPlanet = null;
      focusTransition = 0;
    }

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hoverable, true);

      if (hits.length > 0) {
        let hit = hits[0].object;
        while (hit.parent && !hoverable.includes(hit)) hit = hit.parent;
        if (!hoverable.includes(hit)) hit = null;

        if (hit === sunMesh) {
          if (focusedPlanet) unfocus();
        } else {
          const entry = planets.find((p) => p.mesh === hit);
          if (entry) {
            if (focusedPlanet === entry) {
              unfocus();
            } else {
              focusOn(entry);
            }
          }
        }
      } else {
        if (focusedPlanet) unfocus();
      }
    };
    container.addEventListener('click', onClick);

    const onWheel = () => { if (focusedPlanet) unfocus(); };
    container.addEventListener('wheel', onWheel, { passive: true });

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && focusedPlanet) unfocus();
    };
    window.addEventListener('keydown', onKeyDown);

    function animate() {
      animIdRef.current = requestAnimationFrame(animate);

      if (!pausedRef.current) {
        const delta = 0.016 * speedRef.current;
        sunGroup.rotation.y += delta * 0.05;

        planets.forEach((p) => {
          p.angle += delta * p.speed * 0.4;
          p.mesh.position.x = p.data.distance * Math.cos(p.angle);
          p.mesh.position.z = p.data.distance * Math.sin(p.angle);
          p.mesh.rotation.y += delta * 1.5;

          const moons = p.mesh.userData.moons;
          if (moons) {
            moons.forEach((m) => {
              m.angle += delta * m.speed;
              m.mesh.position.x = p.mesh.position.x + m.radius * Math.cos(m.angle);
              m.mesh.position.z = p.mesh.position.z + m.radius * Math.sin(m.angle);
              m.orbitLine.position.copy(p.mesh.position);
            });
          }
        });
      }

      const lerpFactor = 1 - Math.exp(-4 * (1 / 60));
      if (focusedPlanet) {
        focusTransition = Math.min(1, focusTransition + 0.02);
        const targetPos = focusedPlanet.mesh.position.clone();
        controls.target.lerp(targetPos, lerpFactor);

        const offset = new THREE.Vector3(0, focusedPlanet.data.size * 6, focusedPlanet.data.size * 10);
        const idealCamPos = targetPos.clone().add(offset);
        camera.position.lerp(idealCamPos, lerpFactor);
      } else if (focusTransition > 0) {
        focusTransition = Math.max(0, focusTransition - 0.02);
      }

      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
      labelRenderer.setSize(cw, ch);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} id="scene-container" />;
});

Scene3D.displayName = 'Scene3D';

export default Scene3D;
