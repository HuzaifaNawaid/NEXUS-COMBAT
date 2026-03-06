import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine';
import { GS, InputState, K, P, weaps } from './game/state';
import { ensureAudio, playBGM, audioEnabled, toggleAudio } from './game/audio';
import { MENU_BGM, LEVELS } from './game/constants';
import MainMenu from './components/MainMenu';
import HowToPlay from './components/HowToPlay';
import About from './components/About';
import CharSelect from './components/CharSelect';
import MapSelect from './components/MapSelect';
import HUD from './components/HUD';
import DeathScreen from './components/DeathScreen';
import VictoryScreen from './components/VictoryScreen';
import UpgradeModal from './components/UpgradeModal';
import TouchControls from './components/TouchControls';
import PauseMenu from './components/PauseMenu';

export default function App() {
  const canvas3dRef = useRef<HTMLCanvasElement>(null);
  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [screen, setScreen] = useState('menu'); // menu, charSelect, mapSelect, playing, death, victory
  const [modal, setModal] = useState<string | null>(null); // how, about, upgrade, pause
  const [hudUpdate, setHudUpdate] = useState(0);

  useEffect(() => {
    if (!canvas3dRef.current || !canvas2dRef.current) return;

    const engine = new GameEngine(canvas3dRef.current, canvas2dRef.current);
    engineRef.current = engine;

    engine.onUpdateHUD = () => setHudUpdate((prev) => prev + 1);
    engine.onLevelComplete = () => setScreen('victory');
    engine.onDeath = () => setScreen('death');

    engine.loop();

    const handleKeyDown = (e: KeyboardEvent) => {
      K[e.code] = true;
      if (e.code === 'Digit1') engine.swGun(0);
      if (e.code === 'Digit2') engine.swGun(1);
      if (e.code === 'Digit3') engine.swGun(2);
      if (e.code === 'Digit4') engine.swGun(3);
      if (e.code === 'Digit5' && GS.active && P.alive) engine.shoot();
      if (e.code === 'KeyR' && !P.reloading) engine.startReload();
      if (e.code === 'KeyF') engine.useSpecial();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      K[e.code] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        InputState.mleft = true;
        if (GS.active && P.alive) engine.shoot();
      }
      if (GS.active && !InputState.locked) {
        canvas3dRef.current?.requestPointerLock();
        lockOrientation();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) InputState.mleft = false;
    };

    const handlePointerLockChange = () => {
      InputState.locked = document.pointerLockElement === canvas3dRef.current;
      document.body.classList.toggle('playing', InputState.locked);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (InputState.locked && GS.active) {
        P.yaw -= e.movementX * 0.0022;
        P.pitch = Math.max(-1.2, Math.min(0.55, P.pitch - e.movementY * 0.0022));
        InputState.xhx = window.innerWidth / 2;
        InputState.xhy = window.innerHeight / 2;
      } else {
        InputState.xhx = e.clientX;
        InputState.xhy = e.clientY;
        if (GS.active) {
          P.yaw = -(e.clientX / window.innerWidth - 0.5) * 2 * Math.PI;
          P.pitch = Math.max(-1.2, Math.min(0.55, -(e.clientY / window.innerHeight - 0.5) * 0.9));
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('contextmenu', handleContextMenu);

    const handleInteraction = () => ensureAudio();
    document.addEventListener('click', handleInteraction, { once: false });
    document.addEventListener('touchstart', handleInteraction, { once: false });

    return () => {
      engine.destroy();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const lockOrientation = () => {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  };

  const startGame = (lvlIdx: number) => {
    setScreen('playing');
    engineRef.current?.startLevel(lvlIdx);
    if (!isTouchOnly()) {
      canvas3dRef.current?.requestPointerLock();
    }
  };

  const isTouchOnly = () => {
    return 'ontouchstart' in window && navigator.maxTouchPoints > 0 && !window.matchMedia('(hover:hover)').matches;
  };

  const handlePause = () => {
    if (!GS.active) return;
    GS.active = false;
    document.exitPointerLock();
    document.body.classList.remove('playing');
    setModal('pause');
  };

  const handleResume = () => {
    setModal(null);
    GS.active = true;
    canvas3dRef.current?.requestPointerLock();
    lockOrientation();
  };

  return (
    <>
      <canvas ref={canvas3dRef} id="c3d" className="fixed inset-0 z-0 block w-full h-full" />
      <canvas ref={canvas2dRef} id="xc" className="fixed inset-0 z-20 pointer-events-none w-full h-full" />

      {screen === 'menu' && (
        <MainMenu
          onPlay={() => setScreen('charSelect')}
          onHow={() => setModal('how')}
          onAbout={() => setModal('about')}
        />
      )}

      {screen === 'charSelect' && (
        <CharSelect
          onConfirm={() => setScreen('mapSelect')}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'mapSelect' && (
        <MapSelect
          onSelectMap={startGame}
          onBack={() => setScreen('charSelect')}
        />
      )}

      {screen === 'playing' && (
        <>
          <HUD engine={engineRef.current} updateTrigger={hudUpdate} onPause={handlePause} />
          {isTouchOnly() && <TouchControls engine={engineRef.current} />}
        </>
      )}

      {screen === 'death' && (
        <DeathScreen
          onRetry={() => startGame(GS.level)}
          onMenu={() => {
            setScreen('menu');
            if (audioEnabled) setTimeout(() => playBGM(MENU_BGM), 300);
          }}
        />
      )}

      {screen === 'victory' && (
        <VictoryScreen
          onNext={() => {
            if (GS.level + 1 < LEVELS.length) {
              setModal('upgrade');
            } else {
              setScreen('menu');
              if (audioEnabled) setTimeout(() => playBGM(MENU_BGM), 300);
            }
          }}
          onMenu={() => {
            setScreen('menu');
            if (audioEnabled) setTimeout(() => playBGM(MENU_BGM), 300);
          }}
        />
      )}

      {modal === 'how' && <HowToPlay onClose={() => setModal(null)} />}
      {modal === 'about' && <About onClose={() => setModal(null)} />}
      {modal === 'pause' && <PauseMenu onResume={handleResume} />}
      {modal === 'upgrade' && (
        <UpgradeModal
          onComplete={() => {
            setModal(null);
            setScreen('mapSelect');
          }}
        />
      )}

      <div id="vgn" className="fixed inset-0 pointer-events-none z-[8] opacity-0 transition-opacity duration-100" style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(255, 0, 0, .4) 100%)' }} />
      <div id="sov" className="fixed inset-0 pointer-events-none z-[30] opacity-0 transition-opacity duration-150" style={{ background: 'radial-gradient(ellipse at center, rgba(255, 220, 0, .22) 0%, transparent 70%)' }} />
      <div id="ann" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-['Bebas_Neue'] text-[clamp(30px,6vw,66px)] pointer-events-none z-[35] text-center leading-[1.1] opacity-0 transition-opacity duration-200" style={{ textShadow: '0 0 30px currentColor' }} />

      <div id="landscape-blocker" className="fixed inset-0 bg-[rgba(0,0,0,0.95)] z-[99999] flex-col items-center justify-center text-center p-[30px] backdrop-blur-[10px] hidden portrait:flex md:portrait:hidden">
        <div className="text-[60px] mb-[20px] animate-[rotateIcon_2s_infinite_ease-in-out_alternate]">🔄</div>
        <h1 className="font-['Bebas_Neue'] text-[38px] text-[#ffc844] tracking-[0.15em] mb-[10px]">ROTATE DEVICE</h1>
        <p className="font-['Share_Tech_Mono'] text-[14px] text-[#aaa] tracking-[0.1em] leading-[1.5]">
          NEXUS COMBAT must be played<br />in landscape orientation.<br /><br />Please rotate your phone to continue.
        </p>
      </div>
    </>
  );
}
