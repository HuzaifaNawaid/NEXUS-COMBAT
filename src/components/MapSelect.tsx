import React from 'react';
import { LEVELS, MAP_META, VT } from '../game/constants';
import { GS } from '../game/state';
import { sfx } from '../game/audio';

interface MapSelectProps {
  onSelectMap: (idx: number) => void;
  onBack: () => void;
}

export default function MapSelect({ onSelectMap, onBack }: MapSelectProps) {
  const handleSelect = (idx: number) => {
    if (idx >= GS.unlocked) return;
    sfx.menuClick();
    setTimeout(() => onSelectMap(idx), 220);
  };

  const handleBack = () => {
    sfx.menuClick();
    onBack();
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[100] overflow-y-auto overflow-x-hidden bg-[radial-gradient(ellipse_at_50%_100%,#0a0014,#000_70%)] md:justify-center justify-start md:p-0 pt-[28px] pb-[32px] px-[16px]">
      <div className="font-['Bebas_Neue'] text-[clamp(28px,8vw,44px)] tracking-[0.22em] text-[#ffc844] drop-shadow-[0_0_18px_#ff880066] mb-[4px] text-center">
        SELECT MISSION
      </div>
      <div className="font-['Share_Tech_Mono'] text-[10px] text-[#442] tracking-[0.4em] mb-[28px] text-center">
        Choose your battlefield — defeat the villain within
      </div>
      
      <div className="flex gap-[13px] flex-wrap justify-center max-w-[820px] w-full md:flex-row flex-col items-center">
        {LEVELS.map((L, i) => {
          const meta = MAP_META[i];
          const vd = VT[L.villainIds[L.villainIds.length - 1]];
          const unlocked = i < GS.unlocked;
          
          return (
            <div
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-[clamp(155px,88vw,230px)] md:w-[230px] border rounded-[11px] p-[16px_14px_13px] cursor-pointer bg-[rgba(255,255,255,.02)] transition-all duration-220 relative overflow-hidden ${unlocked ? 'hover:-translate-y-[5px] hover:shadow-[0_0_22px_var(--mc)]' : 'opacity-[.38] cursor-not-allowed grayscale-[.6]'}`}
              style={{
                borderColor: unlocked ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.08)',
                '--mc': meta.col,
              } as React.CSSProperties}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-220 hover:opacity-15"
                style={{ background: `radial-gradient(ellipse at 50% 100%, ${meta.col} 0%, transparent 70%)` }}
              />
              
              <div className="absolute top-[10px] left-[10px] font-['Bebas_Neue'] text-[9px] tracking-[0.2em] px-[7px] py-[2px] rounded-[3px]" style={{ background: `${meta.diffCol}22`, color: meta.diffCol, border: `1px solid ${meta.diffCol}44` }}>
                {meta.diff}
              </div>
              
              {!unlocked && <div className="absolute top-[10px] right-[10px] text-[18px] opacity-70">🔒</div>}
              
              <div className="text-[36px] mb-[6px]">{meta.icon}</div>
              <div className="font-['Bebas_Neue'] text-[10px] tracking-[0.4em] opacity-70 mb-[2px]" style={{ color: meta.col }}>LEVEL {i + 1}</div>
              <div className="font-['Bebas_Neue'] text-[17px] tracking-[0.14em] mb-[5px]" style={{ color: meta.col }}>{L.name}</div>
              
              <div className="flex items-center gap-[6px] mb-[7px] p-[5px_7px] bg-[rgba(0,0,0,.4)] rounded-[5px] border border-[rgba(255,255,255,.06)]">
                <div className="text-[22px]">{vd.icon}</div>
                <div className="text-left">
                  <div className="font-['Bebas_Neue'] text-[12px] text-[#ddd] tracking-[0.08em]">{vd.name}</div>
                  <div className="font-['Share_Tech_Mono'] text-[7px] text-[#446] tracking-[0.2em]">{i === 5 ? 'FINAL BOSS' : 'LEVEL BOSS'} · {Math.round(vd.hp * (i === 5 ? 1.5 : 1))} HP</div>
                </div>
              </div>
              
              <div className="font-['Share_Tech_Mono'] text-[8px] text-[#445] tracking-[0.15em] leading-[1.6]">
                {meta.feats}
                {L.minis.length > 0 && <><br />+ {L.minis.length} minion types</>}
              </div>
            </div>
          );
        })}
      </div>
      
      <button className="font-['Bebas_Neue'] text-[17px] tracking-[0.2em] py-[12px] w-[200px] border border-[rgba(255,40,40,.2)] bg-[rgba(200,0,0,.05)] text-[#ff6644] cursor-pointer rounded-[3px] transition-all duration-200 hover:text-white hover:border-[#ff2200] hover:shadow-[0_0_22px_#ff220044] mt-[22px]" onClick={handleBack}>
        ← BACK
      </button>
    </div>
  );
}
