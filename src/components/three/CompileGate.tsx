"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useState, type ReactNode } from "react";

// Si la compilació en segon pla no acaba (controlador antic, context perdut), es pinta igualment.
const COMPILE_TIMEOUT_MS = 4000;

/**
 * Evita que el primer pintat de l'escena bloquegi la pàgina (adaptat d'ecoreti).
 *
 * El navegador compila els shaders la primera vegada que es fan servir, i s'hi espera de manera
 * síncrona: mesurat aquí, més d'un segon sense resposta just quan l'escena es munta. Amb el bucle
 * aturat, `compileAsync` ho fa en segon pla; quan acaba, es reprèn el bucle sota demanda.
 * Tot el que s'ha de compilar ha de ser visible en aquest moment (three només compila el visible).
 */
export function CompileGate({ name, children }: { name: string; children: ReactNode }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const setFrameloop = useThree((state) => state.setFrameloop);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    let done = false;
    const started = performance.now();
    const finish = () => {
      if (done) return;
      done = true;
      // Visible a la pestanya Performance de les eines del navegador, per poder-ho mesurar.
      performance.measure(`scene-compile:${name}`, { start: started, end: performance.now() });
      setFrameloop("demand");
      setReady(true);
      invalidate();
    };
    setFrameloop("never");
    gl.compileAsync(scene, camera).then(finish, finish);
    const timeout = window.setTimeout(finish, COMPILE_TIMEOUT_MS);
    return () => {
      done = true;
      window.clearTimeout(timeout);
    };
  }, [ready, gl, scene, camera, invalidate, setFrameloop, name]);

  return <>{children}</>;
}
