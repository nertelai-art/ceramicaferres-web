"use client";

// «De la filera a la peça»: el perfil d'una peça Volta es dibuixa, es converteix en filera, el fang
// n'ix extruït, un fil el talla, s'asseca, es cou i les peces formen un mur de celosia que deixa
// passar la llum. Tot és geometria per codi: una celosia és literalment un perfil extruït.
// Coreografia a extrusion-phases.ts (TypeScript pur, amb proves).

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  Path,
  RepeatWrapping,
  Shape,
  SRGBColorSpace,
  Vector3,
  type DirectionalLight,
  type Fog,
  type Group,
  type InstancedMesh,
  type Mesh,
  type PerspectiveCamera,
  type PointLight,
} from "three";
import { seededRandom } from "@/lib/random";
import { CompileGate } from "@/components/three/CompileGate";
import {
  COUNT,
  DIE_X,
  PIECE,
  cameraAt,
  clayStage,
  columnLength,
  columnVisible,
  dieOpacity,
  pieceAt,
  profileDraw,
  profileOpacity,
  sunAt,
  voltaOutline,
} from "./extrusion-phases";

export type SceneProps = { progress: RefObject<number>; reducedMotion: boolean };

const SMOOTHING = 4.5;
const MAX_DELTA = 1 / 30;
const FOV = 34;
// Fons d'estudi clar, com les fotos de producte de Ferrés (el mateix color que la secció).
const BACKGROUND = "#f1eeea";

// Colors del fang segons l'estat (fotos del taller: el fang humit és gris fosc, el cuit, terracota).
const WET = new Color("#6e655e");
const DRY = new Color("#b3aaa0");
const FIRED = new Color("#c2653a");
const EMBER = new Color("#ff5414");

// Temporals reutilitzats: zero objectes nous per fotograma.
const dummy = new Object3D();
const tmpColor = new Color();
const COLUMN_TINT = new Float32Array([1, 1, 1]);
const lookTarget = new Vector3();

function toShape(points: readonly (readonly [number, number])[]) {
  const shape = new Shape();
  points.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.closePath();
  return shape;
}

function toPath(points: readonly (readonly [number, number])[]) {
  const path = new Path();
  points.forEach(([x, y], i) => (i === 0 ? path.moveTo(x, y) : path.lineTo(x, y)));
  path.closePath();
  return path;
}

/** Perfil Volta extruït `depth` unitats al llarg de Z, centrat o començant a 0. */
function pieceGeometry(depth: number, centered: boolean) {
  const { outer, hole } = voltaOutline();
  const shape = toShape(outer);
  shape.holes.push(toPath(hole));
  const bevel = Math.min(0.02, depth * 0.03);
  const geometry = new ExtrudeGeometry(shape, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 24,
  });
  geometry.translate(0, 0, centered ? -depth / 2 + bevel : bevel);
  geometry.computeVertexNormals();
  return geometry;
}

/** Filera: una placa d'acer amb el forat del contorn de la peça, i el nucli que forma l'arc. */
function dieGeometries() {
  const { outer, hole } = voltaOutline();
  const plate = toShape([
    [-1.25, -1.7],
    [1.25, -1.7],
    [1.25, 1.7],
    [-1.25, 1.7],
  ]);
  plate.holes.push(toPath(outer));
  const thickness = 0.28;
  const plateGeometry = new ExtrudeGeometry(plate, { depth: thickness, bevelEnabled: false, curveSegments: 8 });
  plateGeometry.translate(0, 0, -thickness);
  const core = new ExtrudeGeometry(toShape(hole), { depth: thickness + 0.12, bevelEnabled: false, curveSegments: 24 });
  core.translate(0, 0, -thickness - 0.06);
  return { plateGeometry, core };
}

/** Contorn del perfil com a línia, per dibuixar-lo abans que existeixi la filera. */
function profileLineGeometry() {
  const { outer, hole } = voltaOutline();
  const loop = (points: readonly (readonly [number, number])[]) => [...points, points[0]!];
  const all = [...loop(outer), ...loop(hole)];
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(all.flatMap(([x, y]) => [x, y, 0]), 3));
  return { geometry, count: all.length, outerCount: outer.length + 1 };
}

/** Gra del fang: soroll amb llavor pintat una sola vegada. */
function useClayGrain() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1.5, 1.5);
    if (ctx) {
      const random = seededRandom(1956);
      const image = ctx.createImageData(size, size);
      for (let i = 0; i < size * size; i++) {
        const value = 225 + random() * 30 - (random() > 0.985 ? 40 : 0);
        image.data[i * 4] = value;
        image.data[i * 4 + 1] = value;
        image.data[i * 4 + 2] = value;
        image.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    } else {
      console.error("ExtrusionScene: sense context 2D per al gra del fang");
    }
    texture.needsUpdate = true;
    return texture;
  }, []);
}

function Choreography({ progress, reducedMotion }: SceneProps) {
  const { invalidate, size, camera } = useThree();
  const smooth = useRef(reducedMotion ? 1 : (progress.current ?? 0));
  const grain = useClayGrain();

  // Geometries i materials creats una sola vegada i estables des del primer fotograma (canviar-los
  // després recompila shaders). Es modifiquen a useFrame a través de les refs de les malles.
  const assets = useMemo(() => {
    const profile = profileLineGeometry();
    const line = new Line(profile.geometry, new LineBasicMaterial({ color: "#903d00", transparent: true }));
    return {
      pieceGeo: pieceGeometry(PIECE.depth, true),
      columnGeo: pieceGeometry(1, false),
      die: dieGeometries(),
      profile,
      line,
      clay: new MeshStandardMaterial({ color: WET, roughness: 0.92, metalness: 0, map: grain }),
      steel: new MeshStandardMaterial({ color: "#b4aea7", metalness: 0.25, roughness: 0.42, transparent: true, opacity: 0, side: DoubleSide }),
    };
  }, [grain]);

  useEffect(
    () => () => {
      [assets.pieceGeo, assets.columnGeo, assets.die.plateGeometry, assets.die.core, assets.profile.geometry].forEach((g) => g.dispose());
      [assets.clay, assets.steel, assets.line.material as LineBasicMaterial].forEach((m) => m.dispose());
      grain.dispose();
    },
    [assets, grain],
  );

  // Petita variació de to per peça, com passa de debò en sortir del forn.
  const tints = useMemo(() => {
    const random = seededRandom(31);
    const colors = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const light = 0.9 + random() * 0.14;
      colors.set([light, light * (0.97 + random() * 0.04), light * (0.95 + random() * 0.05)], i * 3);
    }
    return colors;
  }, []);

  const pieces = useRef<InstancedMesh>(null);
  const column = useRef<Group>(null);
  const columnMesh = useRef<InstancedMesh>(null);
  const dieGroup = useRef<Group>(null);
  const dieMesh = useRef<Mesh>(null);
  const line = useRef<Line>(null);
  const fog = useRef<Fog>(null);
  const key = useRef<DirectionalLight>(null);
  const sun = useRef<DirectionalLight>(null);
  const ember = useRef<PointLight>(null);

  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate]);

  useFrame((_, rawDelta) => {
    const target = reducedMotion ? 1 : (progress.current ?? 0);
    smooth.current = MathUtils.damp(smooth.current, target, SMOOTHING, Math.min(rawDelta, MAX_DELTA));
    if (Math.abs(smooth.current - target) < 0.0004) smooth.current = target;
    else invalidate();
    const p = smooth.current;

    // Càmera: fotogrames clau, i més lluny com més estreta és la pantalla (que hi càpiga el mur).
    const aspect = size.width / size.height;
    const fit = Math.max(1, Math.pow(1.45 / aspect, 0.8));
    const view = cameraAt(p);
    lookTarget.set(...view.target);
    camera.position.set(
      lookTarget.x + (view.position[0] - lookTarget.x) * fit,
      lookTarget.y + (view.position[1] - lookTarget.y) * fit,
      lookTarget.z + (view.position[2] - lookTarget.z) * fit,
    );
    camera.lookAt(lookTarget);
    // La boira s'allunya amb la càmera: si no, a mòbil (càmera més lluny) se'n menjaria l'escena.
    if (fog.current) {
      fog.current.near = 13 * fit;
      fog.current.far = 30 * fit;
    }
    // Es desplaça el frustum perquè l'escena no quedi sota el text: a escriptori el text és a
    // l'esquerra (escena a la dreta); a mòbil és a dalt (escena més avall).
    const cam = camera as PerspectiveCamera;
    if (size.width >= 1024) cam.setViewOffset(size.width, size.height, -size.width * 0.2, 0, size.width, size.height);
    else cam.setViewOffset(size.width, size.height, 0, -size.height * 0.16, size.width, size.height);

    // 1. El perfil es dibuixa.
    const draw = profileDraw(p);
    if (line.current) {
      const lineMaterial = line.current.material as LineBasicMaterial;
      line.current.geometry.setDrawRange(0, Math.max(2, Math.round(assets.profile.count * draw)));
      lineMaterial.opacity = profileOpacity(p);
      line.current.visible = lineMaterial.opacity > 0.01 && draw > 0;
    }

    // 2. La filera.
    const dieAlpha = dieOpacity(p);
    if (dieMesh.current) (dieMesh.current.material as MeshStandardMaterial).opacity = dieAlpha;
    if (dieGroup.current) {
      dieGroup.current.visible = dieAlpha > 0.01;
      dieGroup.current.scale.setScalar(MathUtils.lerp(0.85, 1, dieAlpha));
    }

    // 3. L'extrusió: una sola columna que s'allarga.
    if (column.current && columnMesh.current) {
      column.current.visible = columnVisible(p);
      columnMesh.current.scale.z = Math.max(0.0001, columnLength(p));
    }

    // 4. Color del fang: humit → sec → cuit, i la brasa del forn.
    const stage = clayStage(p);
    const clay = pieces.current?.material as MeshStandardMaterial | undefined;
    if (clay) {
      tmpColor.lerpColors(WET, DRY, stage.dried);
      clay.color.lerpColors(tmpColor, FIRED, stage.fired);
      clay.emissive.copy(EMBER);
      clay.emissiveIntensity = stage.glow * 0.6;
    }
    if (ember.current) ember.current.intensity = stage.glow * 22;

    // 5. Les peces: tallades a la cinta i després volant cap al mur.
    const mesh = pieces.current;
    if (mesh) {
      for (let i = 0; i < COUNT; i++) {
        const state = pieceAt(i, p);
        dummy.position.set(state.x, state.y, state.z);
        dummy.rotation.set(0, state.yaw, 0);
        dummy.scale.setScalar(state.visible ? 1 : 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    // 6. Surt el sol per darrere del mur: la llum passa pels arcs i en dibuixa l'ombra.
    const sunUp = sunAt(p);
    if (sun.current) sun.current.intensity = sunUp * 2.6;
    if (key.current) key.current.intensity = MathUtils.lerp(1.8, 0.9, sunUp);
  });

  return (
    <>
      <fog ref={fog} attach="fog" args={[BACKGROUND, 13, 30]} />
      <hemisphereLight args={["#ffffff", "#d9cfc3", 1.25]} />
      <directionalLight position={[-6, 3, 4]} intensity={0.5} color="#fff4e8" />
      <directionalLight ref={key} position={[4, 6, 7]} intensity={1.8} color="#fff6ec" />
      <directionalLight
        ref={sun}
        position={[-2.5, 7, -10]}
        intensity={0}
        color="#ffcf98"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={8}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <pointLight ref={ember} position={[0, 1.2, 2]} color="#ff6a2a" intensity={0} distance={12} decay={1.6} />

      {/* Terra: rep l'ombra del mur i la llum que passa pels arcs. */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#ebe5de" roughness={1} />
      </mesh>

      {/* Perfil dibuixat al pla de la filera. */}
      <group position={[DIE_X + 0.01, PIECE.height / 2, 0]} rotation-y={Math.PI / 2}>
        <primitive ref={line} object={assets.line} />
      </group>

      {/* Filera d'acer. */}
      <group ref={dieGroup} position={[DIE_X, PIECE.height / 2, 0]} rotation-y={Math.PI / 2}>
        <mesh ref={dieMesh} geometry={assets.die.plateGeometry} material={assets.steel} />
        <mesh geometry={assets.die.core} material={assets.steel} />
      </group>

      {/* Columna extruïda: geometria de llargada 1, escalada en Z. */}
      <group ref={column} position={[DIE_X, PIECE.height / 2, 0]} rotation-y={Math.PI / 2}>
        {/* Una instància sola: així fa servir el mateix programa de shader que les peces (un menys a compilar). */}
        <instancedMesh ref={columnMesh} args={[assets.columnGeo, assets.clay, 1]} castShadow>
          <instancedBufferAttribute attach="instanceColor" args={[COLUMN_TINT, 3]} />
        </instancedMesh>
      </group>

      {/* Les dotze peces en un sol draw call. */}
      <instancedMesh ref={pieces} args={[assets.pieceGeo, assets.clay, COUNT]} castShadow receiveShadow>
        <instancedBufferAttribute attach="instanceColor" args={[tints, 3]} />
      </instancedMesh>
    </>
  );
}

export default function ExtrusionScene({ progress, reducedMotion }: SceneProps) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      shadows="percentage"
      camera={{ position: [0.6, 1.5, 1.6], fov: FOV, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} flipflops={3} onFallback={() => setDpr(1)} />
      <CompileGate name="extrusio">
        <Choreography progress={progress} reducedMotion={reducedMotion} />
      </CompileGate>
    </Canvas>
  );
}
