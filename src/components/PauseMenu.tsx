import React from 'react';
import { sfx } from '../game/audio';

export default function PauseMenu({ onResume }: { onResume: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(0,0,0,.85)] backdrop-blur-[8px]">
      <div className="bg-[rgba(5,8,18,.97)] border border-[rgba(255,255,255,.1)] rounded-[14px] p-[36px_40px] max-w-[500px] w-[90%] text-center">
        <h2 className="font-['Bebas_Neue'] text-[32px] tracking-[0.2em] text-[#ffc844] mb-[14px]">GAME PAUSED</h2>
        <div className="flex flex-col gap-[10px] items-center w-[260px] mx-auto">
          <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] w-full border border-[rgba(255,140,0,.3)] bg-[rgba(255,60,0,.07)] text-[#ffaa44] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#ff8800] hover:shadow-[0_0_22px_#ff440055] hover:bg-[rgba(255,80,0,.15)]" onClick={() => { sfx.menuClick(); onResume(); }}>
            ▶ RESUME
          </button>
        </div>
      </div>
    </div>
  );
}
