import React, { useEffect, useState } from 'react';
import { GameEngine } from '../game/engine';
import { GS, P, weaps, enemies, UPG } from '../game/state';
import { CHARS, LEVELS } from '../game/constants';
import { toggleAudio, audioEnabled } from '../game/audio';

interface HUDProps {
  engine: GameEngine | null;
  updateTrigger: number;
  onPause: () => void;
}

export default function HUD({ engine, updateTrigger, onPause }: HUDProps) {
  const [killfeed, setKillfeed] = useState<{ id: number; msg: string; col: string }[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; x: number; y: number; dmg: number; isCrit: boolean }[]>([]);

  useEffect(() => {
    if (!engine) return;

    let kfId = 0;
    engine.onKillfeed = (msg, col) => {
      const id = kfId++;
      setKillfeed((prev) => [...prev.slice(-4), { id, msg, col }]);
      setTimeout(() => {
        setKillfeed((prev) => prev.filter((k) => k.id !== id));
      }, 3500);
    };

    let dnId = 0;
    engine.onDamageNumber = (x, y, dmg, isCrit) => {
      const id = dnId++;
      setDamageNumbers((prev) => [...prev, { id, x, y, dmg, isCrit }]);
      setTimeout(() => {
        setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
      }, 1050);
    };

    return () => {
      engine.onKillfeed = undefined;
      engine.onDamageNumber = undefined;
    };
  }, [engine]);

  const C = CHARS[GS.charIdx];
  const L = LEVELS[GS.level];

  const mainEnemies = enemies.filter((e) => e.userData.alive && !e.userData.isMini);
  const miniEnemies = enemies.filter((e) => e.userData.alive && e.userData.isMini);

  let bossName = 'ALL CLEAR';
  let bossCol = '#44ff88';
  let bossPct = 0;
  let bossPhase = '';

  if (mainEnemies.length > 0) {
    const e = mainEnemies[0];
    bossPct = Math.max(0, (e.userData.hp / e.userData.maxHp) * 100);
    bossCol = bossPct > 60 ? '#ff4400' : bossPct > 30 ? '#ffaa00' : '#ff2200';
    bossName = `${e.userData.icon} ${e.userData.name}`;
    bossPhase = e.userData.phase + (miniEnemies.length > 0 ? ` | MINIONS: ${miniEnemies.length}` : '');
  } else if (miniEnemies.length > 0) {
    bossName = `MINIONS: ${miniEnemies.length}`;
    bossCol = '#ff8800';
    bossPct = 100;
    bossPhase = 'DEFEAT ALL MINIONS';
  }

  const isTouchDev = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return (
    <div id="hud" className="fixed inset-0 pointer-events-none z-10 opacity-100 transition-opacity duration-500">
      <div className="absolute top-[18px] left-[18px] md:top-[10px] md:left-[10px]">
        <div className="flex items-center gap-[7px] mb-[7px]">
          <span className="text-[26px]" style={{ filter: `drop-shadow(0 0 6px ${C?.color})` }}>{C?.icon}</span>
          <span className="font-['Bebas_Neue'] text-[15px] tracking-[0.15em]" style={{ color: C?.color }}>{C?.name}</span>
        </div>
        <div className="font-['Bebas_Neue'] text-[12px] md:text-[10px] tracking-[0.22em] md:tracking-[0.14em] bg-[rgba(0,0,0,.7)] border border-[rgba(255,255,255,.1)] px-[13px] md:px-[9px] py-[5px] md:py-[4px] rounded-[20px] text-[#ffc844] backdrop-blur-[6px]">
          LEVEL {GS.level + 1} — {L?.name}
        </div>
        <div className="font-['Share_Tech_Mono'] text-[13px] md:text-[11px] text-[#667] tracking-[0.2em] mt-[5px]">
          SCORE <span>{GS.score}</span>
        </div>
      </div>

      <div className="absolute top-[16px] right-[16px] hidden md:block">
        <canvas id="mmc" width="118" height="118" className="rounded-full border border-[rgba(255,255,255,.1)]" />
      </div>

      <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-[min(460px,62vw)] md:w-[min(300px,78vw)] bg-[rgba(0,0,0,.75)] border border-[rgba(255,80,0,.25)] rounded-[10px] px-[15px] md:px-[10px] py-[9px] md:py-[7px] backdrop-blur-[6px] text-center">
        <div className="font-['Bebas_Neue'] text-[12px] md:text-[10px] tracking-[0.3em] mb-[5px]" style={{ color: bossCol }}>{bossName}</div>
        <div className="h-[11px] bg-[rgba(255,255,255,.07)] rounded-[5px] overflow-hidden mb-[3px]">
          <div className="h-full rounded-[5px] transition-all duration-120" style={{ width: `${bossPct}%`, backgroundColor: bossCol }} />
        </div>
        <div className="font-['Share_Tech_Mono'] text-[8px] md:text-[7px] tracking-[0.3em] text-[#445]">{bossPhase}</div>
      </div>

      <div className="absolute top-[68px] md:top-[52px] right-[14px] md:right-[6px] flex flex-col gap-[3px] items-end">
        {killfeed.map((k) => (
          <div key={k.id} className="font-['Share_Tech_Mono'] text-[10px] md:text-[9px] bg-[rgba(0,0,0,.78)] px-[9px] py-[3px] rounded-[3px] border-l-2 animate-[kfA_.22s_ease]" style={{ borderLeftColor: k.col }}>
            {k.msg}
          </div>
        ))}
      </div>

      <div className="absolute bottom-[24px] md:bottom-[220px] left-[22px] md:left-[10px] w-[230px] md:w-[170px]">
        <div className="mb-[6px]">
          <div className="font-['Share_Tech_Mono'] text-[8px] tracking-[0.3em] mb-[3px] text-[#ff4444]">❤ HEALTH</div>
          <div className="h-[7px] bg-[rgba(255,255,255,.07)] rounded-[4px] overflow-hidden relative">
            <div className="h-full rounded-[4px] transition-all duration-150 bg-[linear-gradient(90deg,#cc0000,#ff5555,#ff9999)]" style={{ width: `${(P.hp / P.maxHp) * 100}%` }} />
            <span className="absolute right-[5px] top-0 text-[9px] font-['Share_Tech_Mono']">{Math.ceil(P.hp)}</span>
          </div>
        </div>
        <div className="mb-[6px]">
          <div className="font-['Share_Tech_Mono'] text-[8px] tracking-[0.3em] mb-[3px] text-[#4488ff]">🛡 SHIELD</div>
          <div className="h-[7px] bg-[rgba(255,255,255,.07)] rounded-[4px] overflow-hidden relative">
            <div className="h-full rounded-[4px] transition-all duration-150 bg-[linear-gradient(90deg,#0044cc,#2277ff,#88aaff)]" style={{ width: `${(P.shield / P.maxShield) * 100}%` }} />
            <span className="absolute right-[5px] top-0 text-[9px] font-['Share_Tech_Mono']">{Math.ceil(P.shield)}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[24px] md:bottom-[220px] left-1/2 -translate-x-1/2 text-center w-[260px] md:w-[180px]">
        <div className="font-['Bebas_Neue'] text-[13px] tracking-[0.4em] text-[#ffc844] mb-[4px]">⚡ SPECIAL POWER</div>
        <div className="h-[13px] bg-[rgba(255,255,255,.06)] rounded-[7px] overflow-hidden border border-[rgba(255,200,0,.12)]">
          <div
            className={`h-full rounded-[7px] bg-[linear-gradient(90deg,#ff8800,#ffcc00,#ffff44)] transition-all duration-180 ${P.spRdy ? 'shadow-[0_0_20px_#ffcc00cc] animate-[spP_.55s_ease-in-out_infinite_alternate]' : ''}`}
            style={{ width: `${(P.special / P.maxSpecial) * 100}%` }}
          />
        </div>
        <div className="font-['Share_Tech_Mono'] text-[8px] text-[#554] mt-[3px] tracking-[0.2em]">
          {P.spRdy ? (isTouchDev ? '⚡ TAP SPECIAL TO UNLEASH!' : '⚡ PRESS [F] TO UNLEASH!') : (isTouchDev ? 'HIT ENEMIES TO CHARGE ⚡' : 'HIT ENEMIES TO CHARGE — [F] UNLEASH')}
        </div>
      </div>

      <div className="absolute bottom-[24px] md:bottom-[205px] right-[22px] md:right-[10px] pointer-events-auto">
        <div className="flex gap-[7px] md:gap-[5px] md:bg-[rgba(0,0,0,.45)] md:p-[6px_7px] md:rounded-[10px] md:border md:border-[rgba(255,255,255,.07)]">
          {weaps.map((w, i) => (
            <div
              key={i}
              className={`w-[68px] h-[76px] md:w-[52px] md:h-[60px] border rounded-[7px] md:rounded-[10px] bg-[rgba(0,0,0,.7)] flex flex-col items-center justify-center gap-[2px] transition-all duration-180 relative cursor-pointer pointer-events-auto touch-manipulation ${i === P.gunIdx ? 'border-[#ffc844] shadow-[0_0_14px_#ffc84444] bg-[rgba(255,200,0,.07)]' : 'border-[rgba(255,255,255,.08)]'}`}
              onClick={(e) => { e.stopPropagation(); engine?.swGun(i); }}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); engine?.swGun(i); }}
            >
              <div className="absolute top-[3px] left-[5px] text-[8px] md:text-[9px] text-[#334] font-['Share_Tech_Mono']">{w.key}</div>
              <div className="text-[24px] md:text-[22px]">{w.icon}</div>
              <div className="font-['Bebas_Neue'] text-[11px] text-[#aaa] tracking-[0.1em] md:hidden">{w.name}</div>
              <div className="font-['Share_Tech_Mono'] text-[9px] text-[#ffc844] md:hidden">{w.curAmmo}/{w.maxAmmo}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={`absolute bottom-[118px] md:bottom-[310px] left-1/2 -translate-x-1/2 text-center transition-opacity duration-200 ${P.reloading ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-[88px] h-[5px] bg-[rgba(255,255,255,.1)] rounded-[3px] overflow-hidden mb-[3px]">
          <div className="h-full bg-[#ffc844] rounded-[3px]" style={{ width: `${(P.reloadT / (weaps[P.gunIdx]?.reload * (1 - UPG.reload * 0.08))) * 100}%` }} />
        </div>
        <div className="font-['Share_Tech_Mono'] text-[8px] text-[#ffc844] tracking-[0.3em]">RELOADING</div>
      </div>

      <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 font-['Share_Tech_Mono'] text-[8px] text-[#223] tracking-[0.22em] whitespace-nowrap md:hidden">
        LMB/[5] SHOOT &nbsp;|&nbsp; [1-4] WEAPON &nbsp;|&nbsp; [R] RELOAD &nbsp;|&nbsp; [F] SPECIAL &nbsp;|&nbsp; CLICK=FPS LOCK
      </div>

      <div
        className="absolute top-[16px] md:top-[10px] right-[185px] md:right-[50px] w-[34px] h-[34px] bg-[rgba(0,0,0,.6)] border border-[rgba(255,255,255,.1)] rounded-full cursor-pointer flex items-center justify-center text-[14px] z-[11] transition-all duration-200 pointer-events-auto hover:border-[#ff8800] hover:shadow-[0_0_12px_#ff44004a]"
        onClick={(e) => { e.stopPropagation(); onPause(); }}
      >
        ⏸
      </div>
      <div
        className="absolute top-[16px] md:top-[10px] right-[145px] md:right-[10px] w-[34px] h-[34px] bg-[rgba(0,0,0,.6)] border border-[rgba(255,255,255,.1)] rounded-full cursor-pointer flex items-center justify-center text-[14px] z-[11] transition-all duration-200 pointer-events-auto hover:border-[#ff8800] hover:shadow-[0_0_12px_#ff44004a]"
        onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
      >
        {audioEnabled ? '🔊' : '🔇'}
      </div>

      {damageNumbers.map((d) => (
        <div
          key={d.id}
          className="fixed font-['Bebas_Neue'] pointer-events-none z-[25] animate-[dfa_1s_ease_forwards]"
          style={{
            left: `${Math.round(d.x)}px`,
            top: `${Math.round(d.y)}px`,
            fontSize: `${d.isCrit ? 34 : 21}px`,
            color: d.isCrit ? '#ff2200' : d.dmg > 40 ? '#ffaa00' : '#ffee44',
          }}
        >
          {d.isCrit ? '⚡' : ''}{Math.round(d.dmg)}
        </div>
      ))}
    </div>
  );
}
