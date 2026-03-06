import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { GS, P, K } from '../game/state';

interface TouchControlsProps {
  engine: GameEngine | null;
}

export default function TouchControls({ engine }: TouchControlsProps) {
  const joyRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const joyIdRef = useRef<number | null>(null);
  const joyOriginRef = useRef({ x: 0, y: 0 });
  const JR = 65;

  useEffect(() => {
    const joyEl = joyRef.current;
    const thumbEl = thumbRef.current;
    if (!joyEl || !thumbEl) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      const r = joyEl.getBoundingClientRect();
      joyOriginRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      joyIdRef.current = t.identifier;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== joyIdRef.current) continue;
        const dx = t.clientX - joyOriginRef.current.x;
        const dy = t.clientY - joyOriginRef.current.y;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), JR);
        const ang = Math.atan2(dy, dx);
        const nx = Math.cos(ang) * dist;
        const ny = Math.sin(ang) * dist;
        thumbEl.style.left = `${40 + nx}px`;
        thumbEl.style.top = `${40 + ny}px`;
        const threshold = 0.28;
        K['KeyW'] = ny / JR < -threshold;
        K['KeyS'] = ny / JR > threshold;
        K['KeyA'] = nx / JR < -threshold;
        K['KeyD'] = nx / JR > threshold;
      }
    };

    const resetJoy = () => {
      joyIdRef.current = null;
      thumbEl.style.left = '40px';
      thumbEl.style.top = '40px';
      K['KeyW'] = false;
      K['KeyS'] = false;
      K['KeyA'] = false;
      K['KeyD'] = false;
    };

    joyEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    joyEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    joyEl.addEventListener('touchend', resetJoy);
    joyEl.addEventListener('touchcancel', resetJoy);

    return () => {
      joyEl.removeEventListener('touchstart', handleTouchStart);
      joyEl.removeEventListener('touchmove', handleTouchMove);
      joyEl.removeEventListener('touchend', resetJoy);
      joyEl.removeEventListener('touchcancel', resetJoy);
    };
  }, []);

  // Aiming touch logic
  useEffect(() => {
    let aimTouchId: number | null = null;
    let lastAimX = 0;
    let lastAimY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const r = joyRef.current?.getBoundingClientRect();
        const hbr = document.getElementById('wbar')?.closest('.hbr') as HTMLElement;
        const wbarRect = hbr ? hbr.getBoundingClientRect() : null;
        const inJoy = r && t.clientX > r.left - 10 && t.clientX < r.right + 10 && t.clientY > r.top - 10 && t.clientY < r.bottom + 10;
        const inWbar = wbarRect ? t.clientX > wbarRect.left - 16 && t.clientX < wbarRect.right + 16 && t.clientY > wbarRect.top - 16 && t.clientY < wbarRect.bottom + 16 : false;
        if (!inJoy && !inWbar && t.clientX > window.innerWidth * 0.42 && aimTouchId === null) {
          aimTouchId = t.identifier;
          lastAimX = t.clientX;
          lastAimY = t.clientY;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === aimTouchId && GS.active) {
          const dx = t.clientX - lastAimX;
          const dy = t.clientY - lastAimY;
          P.yaw -= dx * 0.005;
          P.pitch = Math.max(-1.2, Math.min(0.55, P.pitch - dy * 0.005));
          lastAimX = t.clientX;
          lastAimY = t.clientY;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === aimTouchId) aimTouchId = null;
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return (
    <div id="tc" className="fixed inset-0 z-50 pointer-events-none block">
      <div
        ref={joyRef}
        id="tcJoy"
        className="absolute bottom-[90px] left-[30px] w-[130px] h-[130px] rounded-full bg-[rgba(255,255,255,.06)] border-2 border-[rgba(255,255,255,.15)] pointer-events-auto touch-none"
      >
        <div
          ref={thumbRef}
          id="tcThumb"
          className="absolute w-[50px] h-[50px] rounded-full bg-[rgba(255,140,0,.5)] border-2 border-[#ff8800] left-[40px] top-[40px] pointer-events-none transition-[left,top] duration-50"
        />
        <span className="font-['Bebas_Neue'] text-[9px] text-[rgba(255,255,255,.5)] tracking-[0.15em] text-center mt-[3px] absolute bottom-[-16px] w-full left-0">MOVE</span>
      </div>

      <div
        id="tcFire"
        className="absolute bottom-[120px] right-[28px] w-[76px] h-[76px] rounded-full bg-[rgba(255,40,0,.35)] border-2 border-[#ff4400] flex items-center justify-center text-[26px] pointer-events-auto touch-none select-none"
        onTouchStart={(e) => { e.preventDefault(); if (GS.active && P.alive) engine?.shoot(); }}
        onTouchEnd={(e) => e.preventDefault()}
      >
        🔫
        <span className="font-['Bebas_Neue'] text-[9px] text-[rgba(255,255,255,.5)] tracking-[0.15em] text-center mt-[3px] absolute bottom-[-16px] w-full left-0">FIRE</span>
      </div>

      <div
        id="tcReload"
        className="absolute bottom-[220px] right-[28px] w-[56px] h-[56px] rounded-full bg-[rgba(255,200,0,.25)] border-2 border-[#ffcc00] flex items-center justify-center text-[20px] pointer-events-auto touch-none select-none"
        onTouchStart={(e) => { e.preventDefault(); if (!P.reloading) engine?.startReload(); }}
      >
        🔄
        <span className="font-['Bebas_Neue'] text-[9px] text-[rgba(255,255,255,.5)] tracking-[0.15em] text-center mt-[3px] absolute bottom-[-16px] w-full left-0">RELOAD</span>
      </div>

      <div
        id="tcSpecial"
        className="absolute bottom-[295px] right-[28px] w-[56px] h-[56px] rounded-full bg-[rgba(0,180,255,.25)] border-2 border-[#00c8ff] flex items-center justify-center text-[20px] pointer-events-auto touch-none select-none"
        onTouchStart={(e) => { e.preventDefault(); engine?.useSpecial(); }}
      >
        ⚡
        <span className="font-['Bebas_Neue'] text-[9px] text-[rgba(255,255,255,.5)] tracking-[0.15em] text-center mt-[3px] absolute bottom-[-16px] w-full left-0">SPECIAL</span>
      </div>

      <div
        id="tcJump"
        className="absolute bottom-[120px] right-[115px] w-[48px] h-[48px] rounded-full bg-[rgba(100,255,100,.2)] border-2 border-[#44ff88] flex items-center justify-center text-[18px] pointer-events-auto touch-none select-none"
        onTouchStart={(e) => { e.preventDefault(); K['Space'] = true; setTimeout(() => (K['Space'] = false), 120); }}
      >
        ↑
        <span className="font-['Bebas_Neue'] text-[9px] text-[rgba(255,255,255,.5)] tracking-[0.15em] text-center mt-[3px] absolute bottom-[-16px] w-full left-0">JUMP</span>
      </div>
    </div>
  );
}
