import React from 'react';
import { sfx } from '../game/audio';

interface DeathScreenProps {
  onRetry: () => void;
  onMenu: () => void;
}

export default function DeathScreen({ onRetry, onMenu }: DeathScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] bg-[rgba(0,0,0,.92)]">
      <h1 className="font-['Bebas_Neue'] text-[88px] text-[#ff2200] drop-shadow-[0_0_35px_#ff220088] animate-[dp_1.1s_ease_infinite_alternate]">
        YOU DIED
      </h1>
      <div className="font-['Share_Tech_Mono'] text-[#442] tracking-[0.4em] m-[8px_0_26px] text-[11px]">
        THE VILLAIN PREVAILS
      </div>
      <div className="flex gap-[13px]">
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] px-8 border border-[rgba(255,40,40,.2)] bg-[rgba(200,0,0,.05)] text-[#ff6644] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#ff2200] hover:shadow-[0_0_22px_#ff220044]" onClick={() => { sfx.menuClick(); onRetry(); }}>
          RETRY LEVEL
        </button>
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] px-8 border border-[rgba(0,200,255,.2)] bg-[rgba(0,100,200,.05)] text-[#44aaff] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#00c8ff] hover:shadow-[0_0_22px_#0088ff44]" onClick={() => { sfx.menuClick(); onMenu(); }}>
          MAIN MENU
        </button>
      </div>
    </div>
  );
}
