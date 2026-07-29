import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import "./style.css";

const canvas = document.querySelector(".webgl");
const boot = document.querySelector(".boot");
const root = document.documentElement;
const body = document.body;
const carouselControls = document.querySelector(".carousel-controls");
const carouselButtons = document.querySelectorAll("[data-carousel-direction]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 14);

const world = new THREE.Group();
scene.add(world);

const CAN_HEIGHT = 3.62;

const ambient = new THREE.HemisphereLight(0x566057, 0x010202, 0.42);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0x87958c, 0.75);
keyLight.position.set(-5, 6, 7);
scene.add(keyLight);

const spotTarget = new THREE.Object3D();
scene.add(spotTarget);

const heroSpot = new THREE.SpotLight(
  0xfff1d2,
  255,
  24,
  THREE.MathUtils.degToRad(13),
  0.62,
  1.35,
);
heroSpot.position.set(0, 9, 3.4);
heroSpot.target = spotTarget;
heroSpot.castShadow = true;
heroSpot.shadow.mapSize.set(2048, 2048);
heroSpot.shadow.camera.near = 1;
heroSpot.shadow.camera.far = 24;
heroSpot.shadow.bias = -0.00015;
scene.add(heroSpot);

const rimLight = new THREE.PointLight(0x9bb4ff, 19, 17, 2);
rimLight.position.set(5.5, 0.5, 3);
scene.add(rimLight);

const redLight = new THREE.PointLight(0xff304b, 13, 14, 2);
redLight.position.set(-5, -0.5, 2.5);
scene.add(redLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({
    color: 0x050706,
    roughness: 0.92,
    metalness: 0.04,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.16;
floor.receiveShadow = true;
scene.add(floor);

const assetPath = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const palette = [
  {
    name: "COCA-COLA",
    texture: "assets/brands/coca-cola.jpg",
  },
  {
    name: "7UP",
    texture: "assets/brands/7up.jpg",
  },
  {
    name: "DR-PEPPER",
    texture: "assets/brands/dr-pepper.jpg",
  },
  {
    name: "SPRITE",
    texture: "assets/brands/sprite.jpg",
  },
  {
    name: "FANTA",
    texture: "assets/brands/fanta.jpg",
  },
  {
    name: "PEPSI",
    texture: "assets/brands/pepsi.jpg",
  },
  {
    name: "MTN-DEW",
    texture: "assets/brands/mtn-dew.jpg",
  },
];

const textureLoader = new THREE.TextureLoader();

function loadSleeveTexture(flavor) {
  const texture = textureLoader.load(assetPath(flavor.texture));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function buildCan(source, flavor, index) {
  const can = new THREE.Group();
  can.name = `can-${flavor.name.toLowerCase()}`;

  const model = clone(source);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = CAN_HEIGHT / size.y;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

  const metal = new THREE.MeshPhysicalMaterial({
    color: 0xaeb4b0,
    metalness: 0.62,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  });
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.material = metal;
    child.castShadow = true;
    child.receiveShadow = true;
  });
  can.add(model);

  const sleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(1.112, 1.112, 3.18, 64, 1, true),
    new THREE.MeshPhysicalMaterial({
      map: loadSleeveTexture(flavor),
      roughness: 0.28,
      metalness: 0.18,
      clearcoat: 0.92,
      clearcoatRoughness: 0.14,
      side: THREE.DoubleSide,
    }),
  );
  sleeve.rotation.y = Math.PI * 0.44;
  sleeve.castShadow = true;
  can.add(sleeve);

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0xbec3bc,
    metalness: 0.92,
    roughness: 0.2,
  });

  [-1.7, 1.7].forEach((y) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.055, 12, 64), rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = y;
    rim.castShadow = true;
    can.add(rim);
  });

  const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.03, 1.03, 0.035, 64), rimMaterial);
  lid.position.y = 1.7;
  lid.castShadow = true;
  can.add(lid);

  const tab = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.11, 0.31, 5, 10),
    new THREE.MeshStandardMaterial({ color: 0x8c918c, metalness: 0.95, roughness: 0.22 }),
  );
  tab.scale.set(1.25, 0.34, 1);
  tab.rotation.x = Math.PI / 2;
  tab.rotation.z = 0.22;
  tab.position.set(0.03, 1.735, 0.08);
  tab.castShadow = true;
  can.add(tab);

  const gloss = new THREE.Mesh(
    new THREE.CylinderGeometry(1.124, 1.124, 3.02, 64, 1, true, -0.38, 0.16),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  can.add(gloss);

  can.userData.index = index;
  can.userData.flavor = flavor;
  return can;
}

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, value) => {
  const x = clamp((value - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const bgStops = [
  { at: 0, color: [7, 9, 9] },
  { at: 0.34, color: [8, 17, 12] },
  { at: 0.61, color: [5, 10, 8] },
  { at: 1, color: [3, 4, 4] },
];

function interpolateBackground(progress) {
  let left = bgStops[0];
  let right = bgStops.at(-1);
  for (let i = 0; i < bgStops.length - 1; i += 1) {
    if (progress >= bgStops[i].at && progress <= bgStops[i + 1].at) {
      left = bgStops[i];
      right = bgStops[i + 1];
      break;
    }
  }
  const t = smoothstep(left.at, right.at, progress);
  return left.color.map((value, i) => Math.round(lerp(value, right.color[i], t)));
}

const loader = new GLTFLoader();
let cans = [];
let scrollTarget = 0;
let scrollCurrent = 0;
let previousScroll = 0;
let velocity = 0;
let clock = new THREE.Clock();
let carouselTarget = 0;
let carouselCurrent = 0;
let isDraggingCarousel = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartOffset = 0;

loader.load(
  assetPath("assets/soda-can.glb"),
  ({ scene: source }) => {
    cans = palette.map((flavor, index) => buildCan(source, flavor, index));
    cans.forEach((can) => world.add(can));
    requestAnimationFrame(() => boot.classList.add("is-ready"));
  },
  undefined,
  (error) => {
    console.error("Could not load the soda-can model.", error);
    boot.querySelector(".boot__mark").textContent = "MODEL ERROR";
  },
);

function setCanPose(can, index, progress, time) {
  const introEnd = smoothstep(0.07, 0.26, progress);
  const focusIn = easeInOut(smoothstep(0.21, 0.4, progress));
  const focusOut = easeInOut(smoothstep(0.5, 0.68, progress));
  const returnIn = easeOut(smoothstep(0.7, 0.9, progress));
  const centered = index - 3 + carouselCurrent * (1 - focusIn);
  const isHero = index === 3;

  const compact = innerWidth < 760;
  // On portrait screens the lineup is a horizontally browsable rail. Keeping
  // near-full can-width spacing prevents the seven models from being squeezed
  // into (and intersecting inside) the narrow viewport.
  const spread = compact ? 2.32 : 2.34;
  const introX = centered * spread;
  const introY = -0.45 + Math.cos(centered * 0.8) * 0.38;
  const introZ = -Math.abs(centered) * 0.2;
  const introRotZ = centered * -0.13;
  const introRotX = Math.sin(centered * 0.9) * 0.14;

  const focusHeroX = compact ? 0.72 : 2.65;
  const focusDepth = compact ? 0.3 : 0.5;
  const visibleHeightAtFocus =
    2 *
    (camera.position.z - focusDepth) *
    Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
  const heightFittedScale = (visibleHeightAtFocus * 0.68) / CAN_HEIGHT;
  const focusScale = Math.min(compact ? 1.12 : 1.38, heightFittedScale);
  const outerDirection = centered < 0 ? -1 : 1;
  const outerX = introX + outerDirection * (compact ? 8 : 12) * focusIn;
  const outerY = introY + Math.abs(centered) * 0.35 * focusIn;

  const finalScale = compact ? 0.62 : 0.9;
  const finalSpread = compact ? 1.6 : 2.02;
  const finalX = centered * finalSpread;
  const finalY = -0.72 + Math.abs(centered) * (compact ? 0.14 : 0.1);
  const finalRotZ = centered * 0.055;

  let x = isHero ? lerp(introX, focusHeroX, focusIn) : outerX;
  let y = isHero ? lerp(introY, -0.1, focusIn) : outerY;
  let z = isHero ? lerp(introZ, focusDepth, focusIn) : introZ - focusIn * 3;
  let scale = isHero ? lerp(1, focusScale, focusIn) : lerp(1, 0.7, focusIn);
  let rotX = introRotX;
  let rotY = index * 0.53 + progress * 0.65;
  let rotZ = introRotZ;

  if (isHero) {
    rotY += focusIn * (Math.PI * 2.3) + focusOut * Math.PI * 1.8;
    rotX = lerp(rotX, -0.12, focusIn) + velocity * 0.0015;
    rotZ = lerp(rotZ, 0.11, focusIn) + Math.sin(time * 1.2) * 0.015 * focusIn;
    y += Math.sin(time * 1.35) * 0.045 * focusIn;
  }

  if (returnIn > 0) {
    x = lerp(x, finalX, returnIn);
    y = lerp(y, finalY, returnIn);
    z = lerp(z, 0, returnIn);
    scale = lerp(scale, finalScale, returnIn);
    rotX = lerp(rotX, 0, returnIn);
    rotY = lerp(rotY, index * 0.66 + Math.PI * 2, returnIn);
    rotZ = lerp(rotZ, finalRotZ, returnIn);
  }

  const breathe = 1 + Math.sin(time * 0.9 + index) * 0.004;
  can.position.set(x, y, z);
  can.rotation.set(rotX, rotY, rotZ);
  can.scale.setScalar(scale * breathe);

  const opacityOut = isHero ? 1 : 1 - smoothstep(0.24, 0.34, progress);
  const opacityBack = smoothstep(0.7, 0.84, progress);
  can.visible = Math.max(opacityOut, opacityBack) > 0.02;
  can.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (material.userData.baseOpacity === undefined) {
        material.userData.baseOpacity = material.opacity;
      }
      material.transparent = true;
      material.opacity =
        material.userData.baseOpacity * Math.max(opacityOut, opacityBack);
    });
  });
}

function updateDOM(progress) {
  const [r, g, b] = interpolateBackground(progress);
  root.style.setProperty("--scene-r", r);
  root.style.setProperty("--scene-g", g);
  root.style.setProperty("--scene-b", b);
  root.style.setProperty("--progress", progress);

  const carouselIsActive = progress < 0.205;
  body.classList.toggle("is-carousel-active", carouselIsActive);
  carouselControls.setAttribute("aria-hidden", String(!carouselIsActive));
  carouselButtons.forEach((button) => {
    button.tabIndex = carouselIsActive ? 0 : -1;
  });

  document.querySelectorAll("[data-depth]").forEach((line) => {
    const depth = Number(line.dataset.depth);
    const amount = Math.min(scrollCurrent * innerHeight, innerHeight * 1.3);
    line.style.transform = `translate3d(${amount * depth}px, ${amount * -0.035}px, 0)`;
  });
}

function updateScroll() {
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  scrollTarget = maxScroll > 0 ? scrollY / maxScroll : 0;
}

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  camera.aspect = innerWidth / innerHeight;
  camera.fov = innerWidth < 760 ? 42 : 32;
  camera.position.z = innerWidth < 760 ? 15 : 14;
  camera.updateProjectionMatrix();
}

function updateCarousel(direction) {
  carouselTarget = clamp(carouselTarget + direction * 0.82, -1.7, 1.7);
}

carouselButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateCarousel(Number(button.dataset.carouselDirection));
  });
});

addEventListener("pointerdown", (event) => {
  if (
    scrollCurrent >= 0.205 ||
    event.button !== 0 ||
    event.target.closest("a, button, input, textarea, select")
  ) {
    return;
  }

  isDraggingCarousel = true;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragStartOffset = carouselTarget;
  body.classList.add("is-dragging");
});

addEventListener("pointermove", (event) => {
  if (!isDraggingCarousel) return;

  const deltaX = event.clientX - dragStartX;
  const deltaY = event.clientY - dragStartY;
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
    event.preventDefault();
  }
  carouselTarget = clamp(
    dragStartOffset + (deltaX / innerWidth) * 4.2,
    -1.7,
    1.7,
  );
});

function endCarouselDrag() {
  isDraggingCarousel = false;
  body.classList.remove("is-dragging");
}

addEventListener("pointerup", endCarouselDrag);
addEventListener("pointercancel", endCarouselDrag);

addEventListener(
  "wheel",
  (event) => {
    if (scrollCurrent >= 0.205) return;
    const lateralDelta = event.shiftKey ? event.deltaY : event.deltaX;
    if (Math.abs(lateralDelta) < Math.abs(event.deltaY) * 0.65) return;

    event.preventDefault();
    carouselTarget = clamp(
      carouselTarget - lateralDelta * 0.0028,
      -1.7,
      1.7,
    );
  },
  { passive: false },
);

addEventListener("keydown", (event) => {
  if (
    scrollCurrent >= 0.205 ||
    event.target.matches("input, textarea, select")
  ) {
    return;
  }
  if (event.key === "ArrowLeft") updateCarousel(1);
  if (event.key === "ArrowRight") updateCarousel(-1);
});

addEventListener("scroll", updateScroll, { passive: true });
addEventListener("resize", resize);
updateScroll();

function render() {
  const time = clock.getElapsedTime();
  const smoothing = reducedMotion ? 1 : 0.075;
  scrollCurrent = lerp(scrollCurrent, scrollTarget, smoothing);
  velocity = lerp(velocity, (scrollCurrent - previousScroll) * 10000, 0.12);
  previousScroll = scrollCurrent;
  carouselCurrent = lerp(
    carouselCurrent,
    carouselTarget,
    reducedMotion ? 1 : 0.12,
  );

  updateDOM(scrollCurrent);
  cans.forEach((can, index) => setCanPose(can, index, scrollCurrent, time));

  world.rotation.y = Math.sin(time * 0.28) * 0.015;
  camera.position.x = Math.sin(time * 0.22) * 0.04 + velocity * 0.0002;
  camera.lookAt(0, -0.1, 0);

  const heroCan = cans[3];
  if (heroCan) {
    spotTarget.position.lerp(heroCan.position, reducedMotion ? 1 : 0.16);
    heroSpot.position.x = lerp(
      heroSpot.position.x,
      heroCan.position.x - 0.35,
      reducedMotion ? 1 : 0.12,
    );
  }

  rimLight.intensity = lerp(13, 24, smoothstep(0.18, 0.48, scrollCurrent));
  redLight.intensity = lerp(12, 6, smoothstep(0.35, 0.7, scrollCurrent));

  // The hero can grows around its center. Lower the shadow receiver with it so
  // the plane never slices through the enlarged model's bottom rim.
  const focusPresence =
    smoothstep(0.18, 0.38, scrollCurrent) *
    (1 - smoothstep(0.68, 0.86, scrollCurrent));
  const finalePresence = smoothstep(0.74, 0.9, scrollCurrent);
  const restingFloorY = lerp(-2.16, -2.55, finalePresence);
  floor.position.y = lerp(restingFloorY, -2.92, focusPresence);
  heroSpot.intensity = lerp(255, 340, focusPresence);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
