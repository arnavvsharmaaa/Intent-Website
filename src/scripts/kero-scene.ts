import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { clips } from '../data/kero-manifest.json';

const host = document.getElementById('kero-world');
if (host) {
  const fallback = document.getElementById('scene-fallback');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  host.setAttribute('role', 'button');
  host.tabIndex = 0;
  host.setAttribute('aria-label', 'Kero companion. Activate to change color, or drag to rotate.');
  let touchUntil = 0;
  let touchTimer: number | undefined;
  const touchKero = () => {
    touchUntil = performance.now() + 1100;
    host.dataset.touched = 'true';
    window.clearTimeout(touchTimer);
    touchTimer = window.setTimeout(() => { host.dataset.touched = 'false'; }, 1500);
  };
  host.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); touchKero(); }
  });
  document.querySelector('.fallback-kero')?.addEventListener('pointerdown', touchKero);
  const states: Record<string, { clip: keyof typeof clips; message: string }> = {
    focus: { clip: 'focusing', message: 'A little company for your focus time.' },
    pause: { clip: 'paused', message: 'Take a breath. Your task can wait.' },
    break: { clip: 'break', message: 'A little rest is part of the rhythm.' },
    snooze: { clip: 'sleep', message: 'Quiet time. Kero will be here when you return.' },
  };
  let state = 'focus';
  let updateFrame = (_frame: number) => {};
  document.querySelectorAll<HTMLButtonElement>('[data-state]').forEach(button => {
    button.addEventListener('click', () => {
      state = button.dataset.state!;
      document.querySelectorAll('[data-state]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      document.getElementById('kero-message')!.textContent = states[state].message;
      const frame = clips[states[state].clip].frames[0];
      const sprite = document.querySelector<HTMLElement>('.fallback-kero');
      if (sprite) sprite.style.backgroundPosition = `${(frame % 8) / 7 * 100}% ${Math.floor(frame / 8) / 3 * 100}%`;
      updateFrame(frame);
    });
  });
  try {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 1, 36);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 2 - 0.35;
    controls.maxPolarAngle = Math.PI / 2 + 0.25;
    controls.minAzimuthAngle = -0.6;
    controls.maxAzimuthAngle = 0.6;
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-5, 12, 15);
    scene.add(light);
    const kero = new THREE.Group();
    scene.add(kero);
    const pixels = new THREE.InstancedMesh(new THREE.BoxGeometry(0.49, 0.49, 0.8), new THREE.MeshStandardMaterial({ roughness: 0.8 }), 1024);
    kero.add(pixels);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const touchBounds = new THREE.Box3();
    renderer.domElement.addEventListener('pointerdown', event => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      kero.updateWorldMatrix(true, true);
      pixels.computeBoundingBox();
      touchBounds.setFromObject(kero).expandByScalar(0.7);
      if (pixels.count && raycaster.ray.intersectsBox(touchBounds)) touchKero();
    });
    pixels.count = 0;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(7, 7.3, 0.18, 64), new THREE.MeshStandardMaterial({ color: 0x283c2b, roughness: 1 }));
    base.position.y = -7;
    base.rotation.x = 0.2;
    scene.add(base);
    const resize = () => { const { width, height } = host.getBoundingClientRect(); renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(host);
    resize();
    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(host);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      let lastFrame = -1;
      const matrix = new THREE.Matrix4();
      const color = new THREE.Color();
      // Extrude the original sprite pixels to preserve Kero's actual animation frames.
      updateFrame = (frame: number) => {
        if (frame === lastFrame) return;
        lastFrame = frame;
        const data = context.getImageData(frame % 8 * 32, Math.floor(frame / 8) * 32, 32, 32).data;
        let count = 0;
        for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
          const index = (y * 32 + x) * 4;
          if (data[index + 3] < 100) continue;
          matrix.makeTranslation((x - 15.5) * 0.5, (15.5 - y) * 0.5, 0);
          pixels.setMatrixAt(count, matrix);
          color.setRGB(data[index] / 255, data[index + 1] / 255, data[index + 2] / 255, THREE.SRGBColorSpace);
          pixels.setColorAt(count++, color);
        }
        pixels.count = count;
        pixels.instanceMatrix.needsUpdate = true;
        if (pixels.instanceColor) pixels.instanceColor.needsUpdate = true;
        pixels.computeBoundingSphere();
      };
      updateFrame(clips.focusing.frames[0]);
      fallback!.style.display = 'none';
    };
    image.src = '/companion/sheet.png';
    document.getElementById('reset-scene')?.addEventListener('click', () => controls.reset());
    renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); fallback!.style.display = 'grid'; renderer.domElement.style.display = 'none'; });
    renderer.setAnimationLoop(time => {
      if (!visible || document.hidden) return;
      const clip = clips[states[state].clip];
      const duration = clip.durationsMs.reduce((a,b) => a+b, 0);
      let cursor = reduced.matches ? 0 : time % duration;
      let index = 0;
      while (cursor >= clip.durationsMs[index] && index < clip.frames.length - 1) cursor -= clip.durationsMs[index++];
      updateFrame(clip.frames[index]);
      const touchAmount = Math.max(0, Math.min(1, (touchUntil - performance.now()) / 400));
      pixels.material.emissive.setHex(0x338caf);
      pixels.material.emissiveIntensity = touchAmount * 0.55;
      kero.position.y = reduced.matches || state === 'snooze' ? 0 : Math.sin(time * 0.002) * 0.16;
      kero.rotation.y = reduced.matches ? 0 : Math.sin(time * 0.0006) * 0.08;
      renderer.render(scene, camera);
    });
  } catch {
    if (fallback) fallback.style.display = 'grid';
  }
}
