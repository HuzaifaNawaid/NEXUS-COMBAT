import React, { useMemo } from 'react';
import { UPG_POOL } from '../game/constants';
import { UPG } from '../game/state';
import { sfx } from '../game/audio';

interface UpgradeModalProps {
  onComplete: () => void;
}

export default function UpgradeModal({ onComplete }: UpgradeModalProps) {
  const choices = useMemo(() => {
    return [...UPG_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
  }, []);

  const handleSelect = (id: keyof typeof UPG) => {
    sfx.menuClick();
    UPG[id] = (UPG[id] || 0) + 1;
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(0,0,0,.85)] backdrop-blur-[8px]">
      <div className="bg-[rgba(0,5,18,.96)] border border-[rgba(0,200,255,.2)] rounded-[14px] p-[34px] text-center shadow-[0_0_55px_rgba(0,180,255,.25)] min-w-[340px]">
        <div className="font-['Bebas_Neue'] text-[30px] tracking-[0.2em] text-[#00c8ff] mb-[4px]">POWER UP</div>
        <div className="font-['Share_Tech_Mono'] text-[9px] text-[#224] tracking-[0.3em] mb-[22px]">Choose one upgrade for the next level</div>
        <div className="flex gap-[10px] justify-center">
          {choices.map((u) => (
            <div
              key={u.id}
              className="w-[120px] p-[14px_8px] border border-[rgba(0,200,255,.18)] rounded-[9px] bg-[rgba(0,200,255,.03)] cursor-pointer transition-all duration-200 hover:border-[#00c8ff] hover:shadow-[0_0_18px_#0088ff44] hover:-translate-y-[3px]"
              onClick={() => handleSelect(u.id as keyof typeof UPG)}
            >
              <div className="text-[32px] mb-[6px]">{u.icon}</div>
              <div className="font-['Bebas_Neue'] text-[14px] text-[#00c8ff] tracking-[0.1em]">{u.name}</div>
              <div className="text-[9px] text-[#335] mt-[3px] leading-[1.4]">{u.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
