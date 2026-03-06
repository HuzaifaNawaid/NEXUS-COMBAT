import React from 'react';
import { sfx } from '../game/audio';

export default function About({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(0,0,0,.85)] backdrop-blur-[8px]" onClick={() => { sfx.menuClick(); onClose(); }}>
      <div className="bg-[rgba(5,8,18,.97)] border border-[rgba(255,255,255,.1)] rounded-[14px] p-[36px_40px] max-w-[500px] w-[90%] text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-['Bebas_Neue'] text-[32px] tracking-[0.2em] text-[#ffc844] mb-[14px]">ABOUT NEXUS COMBAT</h2>
        <p className="mb-[12px] text-[14px] text-[#aab] leading-[1.8] text-left">
          A cinematic first-person arena shooter running entirely in the browser. Battle through 6 themed arenas, each guarded by a unique villain with escalating power.
        </p>
        <p className="mb-[12px] text-[14px] text-[#aab] leading-[1.8] text-left">
          Choose from 4 characters with unique specials. Earn upgrades between levels. Level 6 is the ULTIMATE challenge — all 5 previous villains return plus the final boss.
        </p>
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[9px] w-full border border-[rgba(0,200,255,.2)] bg-[rgba(0,100,200,.05)] text-[#44aaff] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#00c8ff] hover:shadow-[0_0_22px_#0088ff44] mt-[18px]" onClick={() => { sfx.menuClick(); onClose(); }}>
          CLOSE
        </button>
      </div>
    </div>
  );
}
