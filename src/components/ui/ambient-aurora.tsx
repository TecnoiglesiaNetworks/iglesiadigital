"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type RGB = { r: number; g: number; b: number };

/* Colores de la marca (violeta → magenta → naranja) para que combine con el hero. */
const COLORS: RGB[] = [
  { r: 106, g: 61, b: 232 }, // brand violeta
  { r: 138, g: 92, b: 255 }, // brand2 violeta claro
  { r: 216, g: 70, b: 160 }, // magenta (puente violeta→naranja)
  { r: 255, g: 80, b: 1 }, // accent naranja
];

/**
 * AuroraCanvas — orbes de color que flotan suavemente (canvas 2D).
 * Adaptado a la marca y optimizado:
 * - Se dimensiona al contenedor padre (no a toda la ventana).
 * - Pausa el render cuando no está en pantalla (IntersectionObserver) y en
 *   pestañas en segundo plano (requestAnimationFrame ya lo hace).
 * - Respeta prefers-reduced-motion (dibuja un frame estático, sin animar).
 */
export function AuroraCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    // Constante no-nula: TS no conserva el estrechamiento dentro de la clase Orb.
    const ctx: CanvasRenderingContext2D = maybeCtx;

    const parent = canvas.parentElement;
    let width = 0;
    let height = 0;

    const setSize = () => {
      const rect = (parent ?? canvas).getBoundingClientRect();
      width = canvas.width = Math.max(1, Math.floor(rect.width));
      height = canvas.height = Math.max(1, Math.floor(rect.height));
    };
    setSize();

    const ro = new ResizeObserver(setSize);
    if (parent) ro.observe(parent);

    class Orb {
      x = 0;
      y = 0;
      radius = 0;
      color: RGB = COLORS[0];
      vx = 0;
      vy = 0;
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 280 + 120;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.vx = (Math.random() - 0.5) * 1.4;
        this.vy = (Math.random() - 0.5) * 1.4;
      }
      draw() {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        g.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.26)`);
        g.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      update(t: number) {
        this.x += this.vx + Math.sin(t * 0.002) * 0.9;
        this.y += this.vy + Math.cos(t * 0.002) * 0.9;
        if (
          this.x < -this.radius ||
          this.x > width + this.radius ||
          this.y < -this.radius ||
          this.y > height + this.radius
        ) {
          this.reset();
        }
      }
    }

    const orbs = Array.from({ length: 7 }, () => new Orb());
    let t = 0;
    let raf = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t++;
      for (const o of orbs) {
        o.update(t);
        o.draw();
      }
      raf = requestAnimationFrame(render);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Solo anima cuando el hero está visible.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduce) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    if (reduce) {
      for (const o of orbs) o.draw(); // frame estático
    } else {
      start();
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={cn("block h-full w-full", className)} />;
}

export default AuroraCanvas;
