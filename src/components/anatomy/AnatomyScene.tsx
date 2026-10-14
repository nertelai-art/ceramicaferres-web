"use client";

// Anatomia d'una peça en 3D: una rajola amb les arestes arrodonides, l'esmalt (brillant, amb la
// mostra real de la carta) que s'aixeca, i una llesca del davant que llisca endavant per deixar
// veure el tall: l'interior porós del cos ceràmic. Sense mapa d'entorn (no cal i bloquejaria la
// pàgina); la brillantor surt dels llums.

import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  CanvasTexture,
  Color,
  MathUtils,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type Group,
  type Mesh,
  type Object3D,
  type PerspectiveCamera,
  type Texture,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MATERIALS, type GlazeFile, type MaterialKey } from "@/data/materials";
import { seededRandom } from "@/lib/random";
import { CompileGate } from "@/components/three/CompileGate";
import { useReducedMotion } from "@/components/scroll/scroll-scene";

export interface AnatomyLabel {
  title: string;
  text?: string;
}

export interface AnatomySceneProps {
  material: MaterialKey;
  glaze: GlazeFile;
  /** 0 = peça sencera, 1 = esmalt aixecat i tall obert. Es llegeix a cada fotograma. */
  spread: RefObject<number>;
  labels?: readonly AnatomyLabel[];
  /** Permet girar la peça arrossegant (a la pàgina de materials, no a la d'inici). */
  interactive?: boolean;
}

// Mides en unitats d'escena: una rajola de 2 × 2, cos de 0,26 i esmalt de 0,04.
const SIZE = 2;
const BODY = 0.26;
const GLAZE = 0.04;
const SLICE = 0.62; // fondària de la llesca del davant
const LIFT = 0.62; // quant puja l'esmalt
const SLIDE = 0.7; // quant llisca la llesca
const SMOOTHING = 5;
const MAX_DELTA = 1 / 30;
/**
 * Part de la mostra d'esmalt que es fa servir (des de baix a l'esquerra): les fotos de la carta
 * tenen el reflex del flaix a dalt a la dreta, i sobre la peça semblaria una taca.
 */
const GLAZE_SAMPLE = 0.5;
/** Amplada mínima (px) per posar les etiquetes al costat de la peça; per sota van en llista. */
const LABELS_MIN_VIEWPORT = 768;

const BODY_SWATCH: Record<MaterialKey, string> = {
  rojo15: "/esmalts/rojo-15.webp",
  arena14: "/esmalts/arena-14.webp",
  gres: "/esmalts/gres-natural.webp",
  vidriat: "/esmalts/rojo-15.webp",
};
/** Color del cos tallat (l'interior no té la pell de la superfície). */
const CUT_COLOR: Record<MaterialKey, string> = { rojo15: "#b4562e", arena14: "#dcb98d", gres: "#9c5230", vidriat: "#b4562e" };

const loader = new TextureLoader();
const textureCache = new Map<string, { texture: Texture; ready: Promise<void> }>();
/** Mostra de la carta com a textura (en memòria cau). `ready` es resol quan la imatge ha arribat. */
function swatchTexture(url: string, repeat: number) {
  const key = `${url}|${repeat}`;
  let entry = textureCache.get(key);
  if (!entry) {
    let done: () => void = () => {};
    const ready = new Promise<void>((resolve) => (done = resolve));
    const texture = loader.load(url, () => done(), undefined, (error) => {
      console.error("AnatomyScene: no s'ha pogut carregar la mostra", url, error);
      done();
    });
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeat, repeat);
    entry = { texture, ready };
    textureCache.set(key, entry);
  }
  return entry;
}

/** Tall del cos: color de l'argila amb porus i grans, amb llavor (sempre igual). */
function poreTexture(base: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  // La cara del tall fa 2 × 0,26 i els UV hi van de 0 a 1: la repetició manté els porus rodons.
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(SIZE * 1.2, BODY * 1.2);
  if (!ctx) {
    console.error("AnatomyScene: sense context 2D per al tall");
    texture.needsUpdate = true;
    return texture;
  }
  const random = seededRandom(1024);
  const color = new Color(base);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  // Grans clars i foscos de la mescla d'argiles.
  for (let i = 0; i < 900; i++) {
    const shade = color.clone().offsetHSL(0, (random() - 0.5) * 0.05, (random() - 0.5) * 0.14);
    ctx.fillStyle = `#${shade.getHexString()}`;
    ctx.fillRect(random() * size, random() * size, 1 + random() * 2, 1 + random() * 2);
  }
  // Porus: buits foscos, una mica allargats en el sentit de l'extrusió.
  for (let i = 0; i < 320; i++) {
    const x = random() * size;
    const y = random() * size;
    const r = 1 + Math.pow(random(), 3) * 5.5;
    ctx.fillStyle = `rgba(40, 18, 8, ${0.3 + random() * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r * (1.2 + random()), r, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  texture.needsUpdate = true;
  return texture;
}

/** Ombra difusa pintada una vegada (no cal un mapa d'ombres per a una peça sola). */
function blobShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(46,32,22,0.42)");
    gradient.addColorStop(0.55, "rgba(46,32,22,0.16)");
    gradient.addColorStop(1, "rgba(46,32,22,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function Label({ index, label, muted }: { index: number; label: AnatomyLabel; muted?: boolean }) {
  return (
    <div className={`w-max max-w-[min(14rem,20vw)] ${muted ? "opacity-35" : ""}`}>
      <span className="flex items-baseline gap-2">
        <span className="num text-xs font-semibold text-terra">{String(index + 1).padStart(2, "0")}</span>
        <span className={`text-sm font-semibold text-carbo ${muted ? "line-through decoration-carbo/40" : ""}`}>{label.title}</span>
      </span>
      {label.text && <span className="mt-1 block text-xs leading-snug text-carbo/70">{label.text}</span>}
    </div>
  );
}

/** Etiquetes i línies guia, fora del canvas. La peça les col·loca a cada fotograma. */
interface LabelOverlay {
  labels: (HTMLDivElement | null)[];
  leaders: (SVGGElement | null)[];
}

const anchorWorld = new Vector3();
/** Mitja alçada de la línia del títol (text-sm): la guia hi arriba al mig. */
const TITLE_MID = 10;
const LABEL_GAP = 14;
const COLUMN_MARGIN = 44;

interface PieceProps extends Omit<AnatomySceneProps, "labels"> {
  overlayRef: RefObject<LabelOverlay>;
  hasLabels: boolean;
}

function Piece({ material, glaze, spread, interactive, overlayRef, hasLabels }: PieceProps) {
  const { invalidate, size, camera } = useThree();
  const smooth = useRef(spread.current ?? 0);
  const reduced = useReducedMotion();
  const glazeGroup = useRef<Group>(null);
  const slice = useRef<Group>(null);
  const shadow = useRef<Mesh>(null);
  const backMesh = useRef<Mesh>(null);
  const glazeMesh = useRef<Mesh>(null);
  const glazeAnchor = useRef<Object3D>(null);
  const bodyAnchor = useRef<Object3D>(null);
  const cutAnchor = useRef<Object3D>(null);
  const placed = useRef("");
  const labelSizes = useRef<{ width: number; sizes: { w: number; h: number }[] } | null>(null);
  const nextMaps = useRef<{ skin: Texture; cut: Texture; glaze: Texture } | null>(null);
  const glazed = MATERIALS[material].glazed;

  const geometries = useMemo(
    () => ({
      back: new RoundedBoxGeometry(SIZE, BODY, SIZE - SLICE, 4, 0.035),
      front: new RoundedBoxGeometry(SIZE, BODY, SLICE, 4, 0.035),
      glaze: new RoundedBoxGeometry(SIZE, GLAZE, SIZE, 4, 0.018),
    }),
    [],
  );
  const cutTextures = useMemo(() => ({ rojo15: poreTexture(CUT_COLOR.rojo15), arena14: poreTexture(CUT_COLOR.arena14), gres: poreTexture(CUT_COLOR.gres) }), []);
  const shadowTexture = useMemo(() => blobShadow(), []);

  // Materials estables; quan canvia el material o l'esmalt només canvien les textures.
  // Es creen ja amb una textura: canviar de «sense map» a «amb map» recompilaria el shader.
  const materials = useMemo(() => {
    const skin = new MeshStandardMaterial({ roughness: 0.82, metalness: 0, map: swatchTexture(BODY_SWATCH.rojo15, 1.4).texture });
    const cut = new MeshStandardMaterial({ roughness: 0.95, metalness: 0, map: cutTextures.rojo15 });
    const glazeMaterial = new MeshPhysicalMaterial({ roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, map: swatchTexture("/esmalts/azul-43.webp", GLAZE_SAMPLE).texture });
    return { skin, cut, glaze: glazeMaterial };
  }, [cutTextures]);

  useEffect(() => {
    const body = material === "vidriat" ? "rojo15" : material;
    const skin = swatchTexture(BODY_SWATCH[material], 1.4);
    const glazeTexture = swatchTexture(`/esmalts/${glaze}.webp`, GLAZE_SAMPLE);
    // S'aplica al proper fotograma, a través de les malles (els materials no es toquen fora de three).
    nextMaps.current = { skin: skin.texture, cut: cutTextures[body], glaze: glazeTexture.texture };
    invalidate();
    // Les mostres poden arribar més tard: es torna a pintar quan són a punt.
    let alive = true;
    void Promise.all([skin.ready, glazeTexture.ready]).then(() => alive && invalidate());
    return () => {
      alive = false;
    };
  }, [material, glaze, cutTextures, invalidate]);

  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
      Object.values(cutTextures).forEach((t) => t.dispose());
      shadowTexture.dispose();
    },
    [geometries, materials, cutTextures, shadowTexture],
  );

  // Cares de la caixa: +x, −x, +y, −y, +z, −z. El tall és la cara que dona a l'altra meitat.
  const backFaces = useMemo(() => [materials.skin, materials.skin, materials.skin, materials.skin, materials.cut, materials.skin], [materials]);
  const frontFaces = useMemo(() => [materials.skin, materials.skin, materials.skin, materials.skin, materials.skin, materials.cut], [materials]);

  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate]);

  /**
   * Etiquetes en una columna a la dreta de la peça, cada una a l'alçada del seu punt (o més avall si
   * no hi cap), amb una línia guia fins al punt. DOM tocat directament, sense setState. Apareixen
   * quan la peça ja s'ha obert: tancada, les capes queden massa juntes.
   */
  function placeLabels(shown: number) {
    const { labels, leaders } = overlayRef.current;
    const anchors = [glazeAnchor.current, bodyAnchor.current, cutAnchor.current];
    // Les mides de les etiquetes només es llegeixen quan canvia l'amplada (llegir-les força el layout).
    if (labelSizes.current?.width !== size.width) {
      labelSizes.current = { width: size.width, sizes: labels.map((el) => ({ w: el?.offsetWidth ?? 0, h: el?.offsetHeight ?? 0 })) };
    }
    const sizes = labelSizes.current.sizes;
    const points = anchors.map((anchor) => {
      if (!anchor) return null;
      anchor.getWorldPosition(anchorWorld).project(camera);
      return { x: ((anchorWorld.x + 1) / 2) * size.width, y: ((1 - anchorWorld.y) / 2) * size.height };
    });
    const widest = Math.max(...sizes.map((s) => s.w));
    const column = Math.min(Math.max(...points.map((pt) => pt?.x ?? 0)) + COLUMN_MARGIN, size.width + 16 - widest);
    // De dalt a baix: cada etiqueta, com a mínim, sota l'anterior.
    const order = points.map((_, i) => i).sort((a, b) => (points[a]?.y ?? 0) - (points[b]?.y ?? 0));
    let floor = -Infinity;
    for (const i of order) {
      const point = points[i];
      const label = labels[i];
      const leader = leaders[i];
      if (!point || !label || !leader) continue;
      const top = Math.max(point.y - TITLE_MID, floor);
      floor = top + (sizes[i]?.h ?? 0) + LABEL_GAP;
      const y = top + TITLE_MID;
      label.style.transform = `translate3d(${column.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
      label.style.opacity = shown.toFixed(3);
      // Sense esmalt, l'etiqueta queda ratllada i sense punt: no hi ha res a assenyalar.
      leader.style.opacity = i === 0 && !glazed ? "0" : shown.toFixed(3);
      leader.firstElementChild?.setAttribute("d", `M${point.x.toFixed(1)} ${point.y.toFixed(1)} L${(column - 22).toFixed(1)} ${y.toFixed(1)} H${(column - 8).toFixed(1)}`);
      leader.lastElementChild?.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
    }
  }

  useFrame((_, rawDelta) => {
    // Textures noves (material o esmalt triat): la pell i el tall són compartits per les dues meitats.
    const maps = nextMaps.current;
    if (maps && backMesh.current && glazeMesh.current) {
      const faces = backMesh.current.material as MeshStandardMaterial[];
      const skin = faces[0]!;
      const cut = faces[4]!;
      const glazeMaterial = glazeMesh.current.material as MeshPhysicalMaterial;
      skin.map = maps.skin;
      cut.map = maps.cut;
      glazeMaterial.map = maps.glaze;
      skin.needsUpdate = cut.needsUpdate = glazeMaterial.needsUpdate = true;
      nextMaps.current = null;
    }

    const target = spread.current ?? 0;
    // Amb moviment reduït, la peça és directament on toca.
    if (reduced) smooth.current = target;
    smooth.current = MathUtils.damp(smooth.current, target, SMOOTHING, Math.min(rawDelta, MAX_DELTA));
    if (Math.abs(smooth.current - target) < 0.0005) smooth.current = target;
    else invalidate();
    const p = easeInOut(MathUtils.clamp(smooth.current, 0, 1));

    // Càmera prou lluny perquè la peça càpiga a qualsevol amplada; amb etiquetes al costat, una mica
    // més lluny i desplaçada a l'esquerra per deixar-los la dreta. Si es pot girar, només es
    // col·loca quan canvia la mida del canvas: entremig la mou qui mira.
    const cam = camera as PerspectiveCamera;
    const sideLabels = hasLabels && window.innerWidth >= LABELS_MIN_VIEWPORT;
    const sizeKey = `${size.width}x${size.height}`;
    if (!interactive || placed.current !== sizeKey) {
      const fit = Math.max(1, Math.pow(1.3 / (size.width / size.height), 0.85)) * (sideLabels ? 1.3 : 1);
      cam.position.set(3.4 * fit, 3.1 * fit, 4.4 * fit);
      cam.lookAt(0, 0.25, 0);
      placed.current = sizeKey;
    }
    if (sideLabels) cam.setViewOffset(size.width, size.height, size.width * 0.17, 0, size.width, size.height);
    else if (cam.view?.enabled) cam.clearViewOffset();
    cam.updateMatrixWorld();

    if (glazeGroup.current) {
      glazeGroup.current.position.y = BODY / 2 + GLAZE / 2 + p * LIFT;
      glazeGroup.current.rotation.x = -p * 0.08;
      glazeGroup.current.visible = glazed;
    }
    if (slice.current) slice.current.position.z = (SIZE - SLICE) / 2 + p * SLIDE;
    if (shadow.current) shadow.current.scale.set(SIZE * 1.9, SIZE * 1.9 + p * SLIDE, 1);

    if (sideLabels) placeLabels(MathUtils.clamp((p - 0.55) / 0.3, 0, 1));
  });

  return (
    <group position={[0, 0, -0.25]}>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0, -BODY / 2 - 0.001, 0.2]}>
        <planeGeometry />
        <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} />
      </mesh>

      {/* Cos: la part del fons i la llesca del davant */}
      <mesh ref={backMesh} geometry={geometries.back} material={backFaces} position={[0, 0, -SLICE / 2]} />
      {/* Punts de les etiquetes: el costat del cos i el tall que queda a la vista quan la llesca surt */}
      <object3D ref={bodyAnchor} position={[SIZE / 2 + 0.004, 0, -SLICE / 2 - 0.25]} />
      <object3D ref={cutAnchor} position={[SIZE / 2 - 0.22, -0.02, (SIZE - SLICE) / 2 - SLICE / 2 + 0.004]} />
      <group ref={slice} position={[0, 0, (SIZE - SLICE) / 2]}>
        <mesh geometry={geometries.front} material={frontFaces} />
      </group>

      {/* Esmalt */}
      <group ref={glazeGroup} position={[0, BODY / 2 + GLAZE / 2, 0]}>
        <mesh ref={glazeMesh} geometry={geometries.glaze} material={materials.glaze} />
        <object3D ref={glazeAnchor} position={[SIZE / 2 - 0.25, GLAZE / 2 + 0.002, -0.45]} />
      </group>
    </group>
  );
}

export default function AnatomyScene({ material, glaze, spread, labels, interactive = false }: AnatomySceneProps) {
  const [dpr, setDpr] = useState(1.75);
  const overlayRef = useRef<LabelOverlay>({ labels: [], leaders: [] });
  const glazed = MATERIALS[material].glazed;
  return (
    <div className="relative h-full w-full">
      <Canvas
        frameloop="demand"
        dpr={dpr}
        camera={{ position: [3.4, 3.1, 4.4], fov: 30, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
        aria-hidden="true"
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} flipflops={3} onFallback={() => setDpr(1)} />
        <hemisphereLight args={["#ffffff", "#d9cfc3", 1.15]} />
        {/* Llum principal de dalt a l'esquerra, contrallum per a la brillantor de l'esmalt i un farciment càlid */}
        <directionalLight position={[-3, 6, 4]} intensity={2.1} color="#fff6ec" />
        <directionalLight position={[2, 4, -5]} intensity={1.6} color="#ffffff" />
        <directionalLight position={[5, 1.5, 3]} intensity={0.45} color="#ffe2c4" />
        <CompileGate name="anatomia">
          <Piece material={material} glaze={glaze} spread={spread} interactive={interactive} overlayRef={overlayRef} hasLabels={Boolean(labels?.length)} />
        </CompileGate>
        {/* Es gira poc de costat: els punts de les etiquetes són a la cara dreta i a la del tall. */}
        {interactive && (
          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={0.55} maxPolarAngle={1.25} minAzimuthAngle={0.1} maxAzimuthAngle={1.35} rotateSpeed={0.55} target={[0, 0.25, 0]} />
        )}
      </Canvas>
      {/* Etiquetes fora del canvas, perquè no les retalli; a mòbil van en llista a sota de la peça. */}
      {labels && (
        <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
          <svg className="absolute inset-0 h-full w-full overflow-visible text-terra">
            {labels.map((label, i) => (
              <g
                key={label.title}
                ref={(element) => {
                  overlayRef.current.leaders[i] = element;
                }}
                opacity={0}
              >
                <path fill="none" stroke="currentColor" strokeWidth={1} />
                <circle r={3.5} fill="currentColor" stroke="#faf8f5" strokeWidth={1.5} />
              </g>
            ))}
          </svg>
          {labels.map((label, i) => (
            <div
              key={label.title}
              ref={(element) => {
                overlayRef.current.labels[i] = element;
              }}
              className="absolute left-0 top-0 opacity-0 will-change-transform"
            >
              <Label index={i} label={label} muted={i === 0 && !glazed} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
