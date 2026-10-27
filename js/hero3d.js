/**
 * hero3d.js – NeuralChat 3D Hero Scene
 * 
 * Calm, premium AI core for index.html:
 * - Icosahedron with simplex-noise GLSL vertex displacement
 * - Thin cyan fresnel rim & violet-cyan body (reads from CSS tokens)
 * - Modest orbiting particles (NormalBlending, tiny sparkles with <=0.5 opacity)
 * - Faint background starfield
 * - Sized ~40% of viewport height, centered behind hero text
 * - DPR capped at 2
 * - Pauses on tab hidden; cleanly disposes on pagehide
 * - Mouse / touch parallax with smooth lerp
 * - Respects prefers-reduced-motion
 * - WebGL failure fallback to CSS gradient orb
 */

import * as THREE from 'three';

let scene, camera, renderer, animId;
let coreMesh, particlesLarge, particlesSparkles, starfield;
let clock, isRunning = false;
let coreMaterial;

const mouse = { x: 0, y: 0 };
const lerpMouse = { x: 0, y: 0 };
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── SIMPLEX 3D NOISE (GLSL) ──
const SIMPLEX_GLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// ── VERTEX SHADER ──
const coreVertexShader = `
${SIMPLEX_GLSL}

uniform float uTime;
uniform float uDisplacement;
uniform float uSpeed;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vFresnel;

void main() {
  float noiseFreq = 1.2;
  vec3 pos = position;
  float n = snoise(pos * noiseFreq + vec3(uTime * uSpeed * 0.25));
  float displacement = n * uDisplacement;
  vec3 displaced = pos + normal * displacement;

  vNormal = normalize(normalMatrix * normal);
  vPosition = displaced;

  vec3 viewDir = normalize(cameraPosition - displaced);
  vFresnel = 1.0 - max(0.0, dot(normalize(normal), viewDir));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

// ── FRAGMENT SHADER ──
const coreFragmentShader = `
uniform float uTime;
uniform vec3 uColorPrimary;
uniform vec3 uColorSecondary;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vFresnel;

void main() {
  // Calm mix between secondary (violet) and primary (cyan)
  float t = uTime * 0.3;
  float wave = sin(vPosition.y * 2.0 + t) * 0.5 + 0.5;
  vec3 bodyColor = mix(uColorSecondary, uColorPrimary, wave * 0.7);

  // Thin cyan fresnel rim
  float rim = pow(vFresnel, 3.0);
  vec3 rimColor = uColorPrimary * 1.2;

  vec3 finalColor = mix(bodyColor, rimColor, rim * 0.85);
  float alpha = 0.88 + rim * 0.12;

  gl_FragColor = vec4(finalColor, alpha);
}
`;

/**
 * Read color hex/rgb string from CSS tokens.
 */
function readColorFromCSS(varName, fallbackHex) {
  if (typeof document === 'undefined') return new THREE.Color(fallbackHex);
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!val) return new THREE.Color(fallbackHex);
  return new THREE.Color(val);
}

/**
 * Initialize the 3D scene. Wrapped in try/catch to ensure it never blocks index.html.
 */
export function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  try {
    // Check WebGL availability
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      showFallback();
      return;
    }

    const heroSection = document.getElementById('hero');
    const width = heroSection?.clientWidth || window.innerWidth;
    const height = heroSection?.clientHeight || window.innerHeight;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5.2;

    clock = new THREE.Clock();

    // Core mesh (~40% of viewport height at camera distance)
    const geometry = new THREE.IcosahedronGeometry(0.88, 32);
    const primaryCol = readColorFromCSS('--primary', '#22D3EE');
    const secondaryCol = readColorFromCSS('--secondary', '#8B5CF6');

    coreMaterial = new THREE.ShaderMaterial({
      vertexShader: coreVertexShader,
      fragmentShader: coreFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uDisplacement: { value: 0.14 },
        uSpeed: { value: 0.6 },
        uColorPrimary: { value: primaryCol },
        uColorSecondary: { value: secondaryCol }
      },
      transparent: true,
      wireframe: false
    });

    coreMesh = new THREE.Mesh(geometry, coreMaterial);
    scene.add(coreMesh);

    // Modest Orbiting Particles (NormalBlending)
    createOrbitingParticles();

    // Faint Starfield
    createStarfield();

    // Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('neuralchat:themechange', updateThemeColors);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', disposeHero3D);

    isRunning = true;
    animate();
  } catch (err) {
    console.warn('[Hero3D] Failed to initialize Three.js:', err);
    showFallback();
  }
}

function createOrbitingParticles() {
  const count = 120;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.3 + Math.random() * 1.2;

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.035,
    color: readColorFromCSS('--primary', '#22D3EE'),
    transparent: true,
    opacity: 0.45,
    blending: THREE.NormalBlending
  });

  particlesLarge = new THREE.Points(geom, mat);
  scene.add(particlesLarge);
}

function createStarfield() {
  const count = 200;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i]     = (Math.random() - 0.5) * 14;
    positions[i + 1] = (Math.random() - 0.5) * 10;
    positions[i + 2] = -2 - Math.random() * 8;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.02,
    color: readColorFromCSS('--text-muted', '#9AA8C7'),
    transparent: true,
    opacity: 0.35,
    blending: THREE.NormalBlending
  });

  starfield = new THREE.Points(geom, mat);
  scene.add(starfield);
}

function updateThemeColors() {
  if (!coreMaterial) return;
  const primaryCol = readColorFromCSS('--primary', '#22D3EE');
  const secondaryCol = readColorFromCSS('--secondary', '#8B5CF6');
  coreMaterial.uniforms.uColorPrimary.value = primaryCol;
  coreMaterial.uniforms.uColorSecondary.value = secondaryCol;

  if (particlesLarge) {
    particlesLarge.material.color = primaryCol;
  }
}

function onWindowResize() {
  const heroSection = document.getElementById('hero');
  if (!heroSection || !renderer || !camera) return;

  const width = heroSection.clientWidth;
  const height = heroSection.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onTouchMove(e) {
  if (e.touches.length > 0) {
    const t = e.touches[0];
    mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
  }
}

function onVisibilityChange() {
  if (document.hidden) {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
  } else if (!isRunning) {
    isRunning = true;
    clock?.start();
    animate();
  }
}

function animate() {
  if (!isRunning) return;
  animId = requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Update uniforms
  if (coreMaterial) {
    coreMaterial.uniforms.uTime.value = time;
  }

  // Smooth mouse parallax lerp
  if (!prefersReducedMotion) {
    lerpMouse.x += (mouse.x - lerpMouse.x) * 0.05;
    lerpMouse.y += (mouse.y - lerpMouse.y) * 0.05;

    if (coreMesh) {
      coreMesh.rotation.y = time * 0.15 + lerpMouse.x * 0.4;
      coreMesh.rotation.x = time * 0.10 + lerpMouse.y * 0.3;
    }

    if (particlesLarge) {
      particlesLarge.rotation.y = -time * 0.08 + lerpMouse.x * 0.2;
    }
  }

  renderer.render(scene, camera);
}

function showFallback() {
  const fallback = document.getElementById('webgl-fallback');
  if (fallback) fallback.removeAttribute('hidden');
  const canvas = document.getElementById('hero-canvas');
  if (canvas) canvas.style.display = 'none';
}

export function disposeHero3D() {
  isRunning = false;
  if (animId) cancelAnimationFrame(animId);

  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('neuralchat:themechange', updateThemeColors);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('pagehide', disposeHero3D);

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }
}
