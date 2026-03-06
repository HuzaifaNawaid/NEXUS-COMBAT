import React, { useState } from 'react';
import { CHARS } from '../game/constants';
import { GS } from '../game/state';
import { sfx } from '../game/audio';

interface CharSelectProps {
  onConfirm: () => void;
  onBack: () => void;
}

export default function CharSelect({ onConfirm, onBack }: CharSelectProps) {
  const [selected, setSelected] = useState<number | null>(GS.charIdx);

  const handleSelect = (idx: number) => {
    sfx.charSelect();
    setSelected(idx);
    GS.charIdx = idx;
  };

  const handleConfirm = () => {
    sfx.menuClick();
    onConfirm();
  };

  const handleBack = () => {
    sfx.menuClick();
    onBack();
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] overflow-y-auto overflow-x-hidden bg-[radial-gradient(ellipse_at_50%_100%,#000d1a,#000_70%)] md:justify-center justify-start md:p-0 pt-[28px] pb-[32px] px-[16px]">
      <div className="font-['Bebas_Neue'] text-[clamp(28px,9vw,46px)] tracking-[0.2em] text-[#00c8ff] drop-shadow-[0_0_18px_#0088ff88] mb-[4px] text-center">
        CHOOSE YOUR FIGHTER
      </div>
      <div className="font-['Share_Tech_Mono'] text-[10px] text-[#224] tracking-[0.4em] mb-[30px] text-center">
        Each warrior carries a unique special ability
      </div>
      
      <div className="flex gap-[16px] flex-wrap justify-center md:flex-row flex-col items-center w-full">
        {CHARS.map((c, i) => {
          const isSelected = selected === i;
          return (
            <div
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-[clamp(140px,42vw,175px)] md:w-[175px] border rounded-[12px] p-[18px_14px_14px] md:p-[13px_10px_10px] text-center cursor-pointer bg-[rgba(255,255,255,.02)] transition-all duration-250 ${isSelected ? 'scale-[1.04] -translate-y-[8px]' : 'hover:scale-[1.04] hover:-translate-y-[8px]'}`}
              style={{
                borderColor: isSelected ? c.color : 'rgba(255,255,255,.1)',
                boxShadow: isSelected ? `0 0 30px ${c.color}, inset 0 0 20px rgba(255,255,255,.03)` : 'none',
              }}
            >
              <span className="text-[44px] md:text-[62px] block mb-[7px]" style={{ filter: `drop-shadow(0 0 14px ${c.color})` }}>{c.icon}</span>
              <div className="font-['Bebas_Neue'] text-[15px] md:text-[19px] tracking-[0.15em] mb-[1px]" style={{ color: c.color }}>{c.name}</div>
              <div className="font-['Share_Tech_Mono'] text-[8px] text-[#335] tracking-[0.25em] mb-[10px]">{c.role}</div>
              
              <div className="flex justify-between mb-[7px] p-[5px_4px] bg-[rgba(0,0,0,.3)] rounded-[5px] border border-[rgba(255,255,255,.05)]">
                <div className="text-center"><span className="font-['Share_Tech_Mono'] text-[7px] text-[#445] block tracking-[0.15em]">❤ HP</span><span className="font-['Bebas_Neue'] text-[15px] tracking-[0.05em]" style={{ color: c.color }}>{c.hp}</span></div>
                <div className="text-center"><span className="font-['Share_Tech_Mono'] text-[7px] text-[#445] block tracking-[0.15em]">🛡 SHD</span><span className="font-['Bebas_Neue'] text-[15px] tracking-[0.05em]" style={{ color: c.color }}>{c.shield}</span></div>
                <div className="text-center"><span className="font-['Share_Tech_Mono'] text-[7px] text-[#445] block tracking-[0.15em]">⚡ SPD</span><span className="font-['Bebas_Neue'] text-[15px] tracking-[0.05em]" style={{ color: c.color }}>{Math.round(c.spd * 10)}</span></div>
              </div>
              
              <div className="mb-[10px]">
                {[
                  ['HP', c.stats.HP],
                  ['SHIELD', c.stats.SHIELD],
                  ['SPEED', c.stats.SPEED],
                  ['POWER', c.stats.POWER],
                ].map(([lbl, val], idx) => (
                  <div key={idx} className="flex items-center gap-[6px] my-[4px]">
                    <span className="font-['Share_Tech_Mono'] text-[8px] text-[#556] w-[44px] text-right tracking-[0.1em]">{lbl}</span>
                    <div className="flex-1 h-[5px] bg-[rgba(255,255,255,.07)] rounded-[3px] overflow-hidden">
                      <div className="h-full rounded-[3px] transition-all duration-300" style={{ width: `${(val as number) * 20}%`, backgroundColor: c.color }} />
                    </div>
                    <span className="font-['Share_Tech_Mono'] text-[8px] w-[14px] text-left" style={{ color: c.color }}>{val}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-[9px] opacity-80 border-t border-[rgba(255,255,255,.07)] pt-[8px] mt-[4px] leading-[1.5]" style={{ color: c.color }}>
                ⚡ {c.special}<br /><small className="opacity-60">{c.sdesc}</small>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex gap-4 mt-[26px]">
        <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] px-8 border border-[rgba(255,40,40,.2)] bg-[rgba(200,0,0,.05)] text-[#ff6644] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#ff2200] hover:shadow-[0_0_22px_#ff220044]" onClick={handleBack}>
          ← BACK
        </button>
        <button 
          className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] px-8 border border-[rgba(255,140,0,.3)] bg-[rgba(255,60,0,.07)] text-[#ffaa44] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#ff8800] hover:shadow-[0_0_22px_#ff440055] hover:bg-[rgba(255,80,0,.15)] disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-[rgba(255,140,0,.3)] disabled:hover:shadow-none disabled:hover:text-[#ffaa44] disabled:hover:bg-[rgba(255,60,0,.07)]" 
          disabled={selected === null}
          onClick={handleConfirm}
        >
          ⚔ DEPLOY TO COMBAT
        </button>
      </div>
    </div>
  );
}
