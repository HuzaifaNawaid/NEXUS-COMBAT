import React from 'react';
import { GS } from '../game/state';
import { sfx } from '../game/audio';

interface VictoryScreenProps {
  onNext: () => void;
  onMenu: () => void;
}

export default function VictoryScreen({ onNext, onMenu }: VictoryScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] bg-[rgba(0,0,0,.92)]">
      <h1 className="font-['Bebas_Neue'] text-[76px] bg-[linear-gradient(135deg,#44ff88,#ffee00)] bg-clip-text text-transparent">
        LEVEL CLEAR!
      </h1>
      <div className="font-['Share_Tech_Mono'] text-[#224] tracking-[0.4em] text-[10px] m-[6px_0_4px]">
        VILLAIN DEFEATED
      </div>
      <div className="font-['Share_Tech_Mono'] text-[22px] text-[#ffc844] m-[10px_0_30px]">
        SCORE: {GS.score}
      </div>
      <div className="flex gap-[13px]">
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] px-8 border border-[rgba(255,140,0,.3)] bg-[rgba(255,60,0,.07)] text-[#ffaa44] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#ff8800] hover:shadow-[0_0_22px_#ff440055] hover:bg-[rgba(255,80,0,.15)]" onClick={() => { sfx.menuClick(); onNext(); }}>
          NEXT LEVEL ▶
        </button>
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] px-8 border border-[rgba(0,200,255,.2)] bg-[rgba(0,100,200,.05)] text-[#44aaff] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#00c8ff] hover:shadow-[0_0_22px_#0088ff44]" onClick={() => { sfx.menuClick(); onMenu(); }}>
          MAIN MENU
        </button>
      </div>
    </div>
  );
}
