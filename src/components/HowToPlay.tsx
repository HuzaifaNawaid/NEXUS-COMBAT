import React from 'react';
import { sfx } from '../game/audio';

export default function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(0,0,0,.85)] backdrop-blur-[8px]" onClick={() => { sfx.menuClick(); onClose(); }}>
      <div className="bg-[rgba(5,8,18,.97)] border border-[rgba(255,255,255,.1)] rounded-[14px] p-[36px_40px] max-w-[500px] w-[90%] text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-['Bebas_Neue'] text-[32px] tracking-[0.2em] text-[#ffc844] mb-[14px]">HOW TO PLAY</h2>
        <ul className="pl-[16px] mb-[18px] text-[14px] text-[#aab] leading-[1.8] text-left list-disc">
          <li><b className="text-[#ffc844]">WASD</b> — Move around the arena</li>
          <li><b className="text-[#ffc844]">Mouse</b> — Aim and look in any direction (360°)</li>
          <li><b className="text-[#ffc844]">Left Click / Key [5]</b> — Shoot your weapon</li>
          <li><b className="text-[#ffc844]">Keys [1–4]</b> — Switch between 4 weapons</li>
          <li><b className="text-[#ffc844]">[R]</b> — Reload current weapon</li>
          <li><b className="text-[#ffc844]">[F]</b> — Unleash Special Move (when bar is full)</li>
          <li><b className="text-[#ffc844]">Shift</b> — Sprint faster | <b className="text-[#ffc844]">Space</b> — Jump</li>
          <li><b className="text-[#ffc844]">Click screen</b> — Enable FPS lock mode</li>
        </ul>
        <p className="mt-[8px] text-[14px] text-[#aab] leading-[1.8] text-left">
          Hit villains to charge your <b className="text-[#ffc844]">Special Bar ⚡</b>. Level 6 brings ALL villains back!
        </p>
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[9px] w-full border border-[rgba(0,200,255,.2)] bg-[rgba(0,100,200,.05)] text-[#44aaff] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#00c8ff] hover:shadow-[0_0_22px_#0088ff44] mt-[18px]" onClick={() => { sfx.menuClick(); onClose(); }}>
          CLOSE
        </button>
      </div>
    </div>
  );
}
