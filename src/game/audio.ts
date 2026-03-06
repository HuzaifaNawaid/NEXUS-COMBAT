export let audioCtx: AudioContext | null = null;
export let masterGain: GainNode | null = null;
export let musicNodes: any[] = [];
export let audioEnabled = true;

export function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.7, audioCtx.currentTime);
  const comp = audioCtx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 6;
  comp.ratio.value = 4;
  masterGain.connect(comp);
  comp.connect(audioCtx.destination);
}

export function toggleAudio() {
  audioEnabled = !audioEnabled;
  if (!audioCtx || !masterGain) return;
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(audioEnabled ? 0.7 : 0, audioCtx.currentTime + 0.3);
}

export function stopBGM() {
  musicNodes.forEach((n) => {
    try {
      n.stop();
    } catch (_) {}
  });
  musicNodes = [];
}

export function playBGM(cfg: any) {
  if (!audioCtx || !audioEnabled || !masterGain) return;
  stopBGM();
  const t = audioCtx.currentTime;
  const bpm = cfg.tempo;

  const dOsc = audioCtx.createOscillator();
  const dGain = audioCtx.createGain();
  const dFilt = audioCtx.createBiquadFilter();
  dOsc.type = 'sawtooth';
  dOsc.frequency.setValueAtTime(cfg.drone, t);
  dFilt.type = 'lowpass';
  dFilt.frequency.setValueAtTime(cfg.filt, t);
  dFilt.Q.value = 2;
  dGain.gain.setValueAtTime(0, t);
  dGain.gain.linearRampToValueAtTime(cfg.vol * 0.55, t + 2);
  dOsc.connect(dFilt);
  dFilt.connect(dGain);
  dGain.connect(masterGain);
  dOsc.start(t);
  musicNodes.push(dOsc, dGain, dFilt);

  const lfo = audioCtx.createOscillator();
  const lfoG = audioCtx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.12, t);
  lfoG.gain.setValueAtTime(cfg.drone * 0.03, t);
  lfo.connect(lfoG);
  lfoG.connect(dOsc.frequency);
  lfo.start(t);
  musicNodes.push(lfo, lfoG);

  const scheduleBeat = (when: number) => {
    if (!audioCtx || !masterGain) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(cfg.bass, when);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(cfg.vol * 0.65, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + bpm * 0.85);
    const f = audioCtx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(320, when);
    osc.connect(f);
    f.connect(g);
    g.connect(masterGain);
    osc.start(when);
    osc.stop(when + bpm);
    musicNodes.push(osc, g, f);
  };

  let beatIntervalId: any;
  let beatT = t + 0.1;
  const scheduleBeats = () => {
    if (!audioCtx) return;
    while (beatT < audioCtx.currentTime + 2.0) {
      scheduleBeat(beatT);
      beatT += bpm;
    }
  };
  scheduleBeats();
  beatIntervalId = setInterval(scheduleBeats, 800);
  musicNodes.push({ stop: () => clearInterval(beatIntervalId) });

  const shimOsc = audioCtx.createOscillator();
  const shimG = audioCtx.createGain();
  shimOsc.type = 'sine';
  shimOsc.frequency.setValueAtTime(cfg.drone * 3.02, t);
  shimG.gain.setValueAtTime(0, t);
  shimG.gain.linearRampToValueAtTime(cfg.vol * 0.08, t + 3);
  shimOsc.connect(shimG);
  shimG.connect(masterGain);
  shimOsc.start(t);
  musicNodes.push(shimOsc, shimG);
}

export const sfx = {
  _tone: (freq: number, type: OscillatorType, dur: number, vol: number, decay: number) => {
    if (!audioCtx || !audioEnabled || !masterGain) return;
    const o = audioCtx.createOscillator(),
      g = audioCtx.createGain();
    const t = audioCtx.currentTime;
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol || 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (decay || dur || 0.15));
    o.connect(g);
    g.connect(masterGain);
    o.start(t);
    o.stop(t + (dur || 0.2));
  },
  _noise: (dur: number, vol: number, filt: number) => {
    if (!audioCtx || !audioEnabled || !masterGain) return;
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * (dur || 0.08), audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    const f = audioCtx.createBiquadFilter(),
      g = audioCtx.createGain();
    const t = audioCtx.currentTime;
    src.buffer = buf;
    f.type = 'bandpass';
    f.frequency.value = filt || 800;
    f.Q.value = 1.5;
    g.gain.setValueAtTime(vol || 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.08));
    src.connect(f);
    f.connect(g);
    g.connect(masterGain);
    src.start(t);
  },
  shoot(wepIdx: number) {
    if (!audioCtx || !audioEnabled || !masterGain) return;
    initAudio();
    const t = audioCtx.currentTime;
    const pitches = [680, 420, 900, 320];
    sfx._noise(0.06, 0.28, pitches[wepIdx] || 680);
    const o = audioCtx.createOscillator(),
      g = audioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(pitches[wepIdx] || 680, t);
    o.frequency.exponentialRampToValueAtTime((pitches[wepIdx] || 680) * 0.3, t + 0.05);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g);
    g.connect(masterGain);
    o.start(t);
    o.stop(t + 0.08);
  },
  hit() {
    if (!audioCtx || !audioEnabled) return;
    sfx._noise(0.04, 0.22, 1200);
    sfx._tone(180, 'sine', 0.05, 0.15, 0.05);
  },
  playerHit() {
    if (!audioCtx || !audioEnabled) return;
    sfx._noise(0.09, 0.3, 400);
    sfx._tone(120, 'sine', 0.12, 0.2, 0.12);
  },
  reload() {
    if (!audioCtx || !audioEnabled) return;
    sfx._noise(0.03, 0.2, 2200);
    setTimeout(() => {
      if (audioCtx && audioEnabled) {
        sfx._tone(660, 'triangle', 0.06, 0.1, 0.06);
      }
    }, 80);
    setTimeout(() => {
      if (audioCtx && audioEnabled) {
        sfx._noise(0.04, 0.18, 1800);
      }
    }, 160);
  },
  special() {
    if (!audioCtx || !audioEnabled || !masterGain) return;
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator(),
      g = audioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(1200, t + 0.55);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.38, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    const f = audioCtx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(3000, t);
    o.connect(f);
    f.connect(g);
    g.connect(masterGain);
    o.start(t);
    o.stop(t + 0.65);
    sfx._noise(0.4, 0.18, 600);
  },
  enemyDie() {
    if (!audioCtx || !audioEnabled || !masterGain) return;
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator(),
      g = audioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(440, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.45);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g);
    g.connect(masterGain);
    o.start(t);
    o.stop(t + 0.5);
    sfx._noise(0.18, 0.2, 800);
  },
  playerDie() {
    if (!audioCtx || !audioEnabled || !masterGain) return;
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator(),
      g = audioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(280, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 1.8);
    g.gain.setValueAtTime(0.35, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o.connect(g);
    g.connect(masterGain);
    o.start(t);
    o.stop(t + 2);
    sfx._noise(0.5, 0.25, 300);
  },
  victory() {
    if (!audioCtx || !audioEnabled) return;
    [0, 0.12, 0.24, 0.38, 0.54].forEach((delay, i) => {
      const freq = [260, 330, 390, 520, 650][i];
      setTimeout(() => sfx._tone(freq, 'sine', 0.18, 0.22 * (1 - i * 0.05), 0.18), delay * 1000);
    });
  },
  levelStart() {
    if (!audioCtx || !audioEnabled || !masterGain) return;
    const t = audioCtx.currentTime;
    sfx._noise(0.25, 0.3, 400);
    const o = audioCtx.createOscillator(),
      g = audioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(60, t + 0.05);
    o.frequency.linearRampToValueAtTime(120, t + 0.3);
    g.gain.setValueAtTime(0, t + 0.05);
    g.gain.linearRampToValueAtTime(0.28, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    o.connect(g);
    g.connect(masterGain);
    o.start(t + 0.05);
    o.stop(t + 0.45);
  },
  menuClick() {
    if (!audioCtx || !audioEnabled) return;
    sfx._tone(520, 'sine', 0.05, 0.12, 0.05);
  },
  charSelect() {
    if (!audioCtx || !audioEnabled) return;
    sfx._tone(660, 'triangle', 0.06, 0.14, 0.06);
    setTimeout(() => sfx._tone(880, 'triangle', 0.05, 0.10, 0.05), 80);
  },
};

export function ensureAudio() {
  if (!audioCtx) {
    initAudio();
  } else if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}
