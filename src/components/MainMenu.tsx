import React from 'react';
import { sfx } from '../game/audio';

interface MainMenuProps {
  onPlay: () => void;
  onHow: () => void;
  onAbout: () => void;
}

export default function MainMenu({ onPlay, onHow, onAbout }: MainMenuProps) {
  const handlePlay = () => {
    sfx.menuClick();
    onPlay();
  };

  const handleHow = () => {
    sfx.menuClick();
    onHow();
  };

  const handleAbout = () => {
    sfx.menuClick();
    onAbout();
  };

  const handleExit = () => {
    sfx.menuClick();
    window.location.href = 'about:blank';
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] overflow-y-auto overflow-x-hidden bg-[radial-gradient(ellipse_at_50%_80%,#120400,#000_70%)]">
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_59px,rgba(255,80,0,.03)_60px),repeating-linear-gradient(90deg,transparent,transparent_59px,rgba(255,80,0,.03)_60px)]" />
      
      <div className="font-['Bebas_Neue'] text-[clamp(72px,13vw,148px)] leading-[0.88] text-center tracking-[0.06em] bg-[linear-gradient(180deg,#fff_0%,#ff9900_45%,#ff2200_100%)] bg-clip-text text-transparent drop-shadow-[0_0_50px_#ff440077] animate-[lb_2.5s_ease-in-out_infinite_alternate] z-10">
        NEXUS<br />COMBAT
      </div>
      
      <div className="font-['Share_Tech_Mono'] text-[11px] tracking-[0.5em] text-[#ff6600aa] mb-[44px] z-10">
        Cinematic Arena Shooter
      </div>
      
      <div className="flex flex-col gap-[10px] items-center w-[260px] max-w-[320px] z-10">
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] w-full border border-[rgba(255,140,0,.3)] bg-[rgba(255,60,0,.07)] text-[#ffaa44] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#ff8800] hover:shadow-[0_0_22px_#ff440055] hover:bg-[rgba(255,80,0,.15)]" onClick={handlePlay}>
          ▶ ENTER THE ARENA
        </button>
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] w-full border border-[rgba(0,200,255,.2)] bg-[rgba(0,100,200,.05)] text-[#44aaff] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#00c8ff] hover:shadow-[0_0_22px_#0088ff44]" onClick={handleHow}>
          📖 HOW TO PLAY
        </button>
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] w-full border border-[rgba(0,200,255,.2)] bg-[rgba(0,100,200,.05)] text-[#44aaff] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#00c8ff] hover:shadow-[0_0_22px_#0088ff44]" onClick={handleAbout}>
          ℹ ABOUT
        </button>
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] w-full border border-[rgba(255,40,40,.2)] bg-[rgba(200,0,0,.05)] text-[#ff6644] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#ff2200] hover:shadow-[0_0_22px_#ff220044]" onClick={handleExit}>
          ✕ EXIT
        </button>
      </div>
    </div>
  );
}
