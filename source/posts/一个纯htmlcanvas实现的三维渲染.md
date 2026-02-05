---
title: 一个纯htmlcanvas实现的三维渲染
date: 2026-01-02 20:37:12
tags:
---

来源 `https://www.bilibili.com/video/BV1TzBoBqEY6`， 觉得十分有意思，遂用react重新实现一遍

```tsx
import React, { useEffect, useRef } from "react";
import "./App.css";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Point2D {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const initialPoints: Point3D[] = [
    { x: 0.25, y: 0.25, z: 0.25 },
    { x: 0.25, y: -0.25, z: 0.25 },
    { x: -0.25, y: -0.25, z: 0.25 },
    { x: -0.25, y: 0.25, z: 0.25 },

    { x: 0.25, y: 0.25, z: -0.25 },
    { x: 0.25, y: -0.25, z: -0.25 },
    { x: -0.25, y: -0.25, z: -0.25 },
    { x: -0.25, y: 0.25, z: -0.25 },
  ];
  const faces = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const pointsRef = useRef<Point3D[]>(initialPoints);
  const dtRef = useRef<number>(0);

  const intervalRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const fps = 60;

  const BACKGROUND_COLOR = "#101010";
  const FOREGROUND_COLOR = "#50FF50";

  const clear = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const drawPoint = ({ x, y }: Point2D) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const s = 10;

    ctx.fillStyle = FOREGROUND_COLOR;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  };

  /**
   * 把3D点投影到2D平面上
   */
  const project = ({ x, y, z }: Point3D): Point2D => {
    const cameraZ = -1;
    const zc = z - cameraZ;
    return {
      x: x / zc,
      y: y / zc,
    };
  };

  /**
   * (-1, 1) => (0, 2) => (0..1) => (0.. w/h)
   */
  const screen = (point: {
    x: number;
    y: number;
  }): { x: number; y: number } => {
    const changedX = ((point.x + 1) / 2) * canvasRef.current!.width;
    const changedY = (1 - (point.y + 1) / 2) * canvasRef.current!.height;

    return { x: changedX, y: changedY };
  };

  // const tranlate_z = ({ x, y, z }: Point3D, dt: number): Point3D => {
  //   return {
  //     x,
  //     y,
  //     z: z + 0.1 * dt
  //   }
  // }

  const rotate_xz = ({ x, y, z }: Point3D, angle: number): Point3D => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return {
      x: x * c - z * s,
      y,
      z: x * s + z * c,
    };
  };

  const line: (p1: Point2D, p2: Point2D) => void = (p1, p2) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.strokeStyle = FOREGROUND_COLOR;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  };

  const frame = () => {
    const nextDt = dtRef.current + 1 / fps;
    const currentPoints = pointsRef.current;
    const nextPoints = currentPoints.map((point) => {
      // return tranlate_z(rotate_xz(point, Math.PI * nextDt), nextDt)
      return rotate_xz(point, Math.PI * nextDt);
    });

    pointsRef.current = nextPoints;

    clear();

    nextPoints.forEach((point) => {
      drawPoint(screen(project(point)));
    });

    faces.forEach((face) => {
      for (let i = 0; i < face.length; i++) {
        const a = face[i];
        const b = face[(i + 1) % face.length];
        const p1 = screen(project(nextPoints[a]));
        const p2 = screen(project(nextPoints[b]));
        line(p1, p2);
      }
    });
  };

  const startPlay = () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    intervalRef.current = window.setInterval(frame, 1000 / fps);
  };

  const clean = () => {
    if (intervalRef.current !== null) {
      pointsRef.current = initialPoints;
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    dtRef.current = 0;
    pointsRef.current = initialPoints;
    clear();
    isPlayingRef.current = false;
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    console.log(`${canvas}`);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    console.log(`${ctx}`);
    if (!ctx) return;

    return clean;
  }, []);

  return (
    <>
      <div>
        <canvas id="game" ref={canvasRef} width={800} height={800} />
      </div>
      <div>
        <button onClick={clean}>Stop</button>
        <button onClick={startPlay}>Play</button>
      </div>
    </>
  );
};
export default App;
```

```

```
