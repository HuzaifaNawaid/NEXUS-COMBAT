export const CHARS = [
  { id: 0, name: 'GHOST', role: 'Spec-Ops Ghost', icon: '👻', color: '#00c8ff', hp: 90, shield: 120, spd: 1.3, special: 'PHANTOM BURST', sdesc: '8 rapid crits', stats: { HP: 3, SHIELD: 5, SPEED: 5, POWER: 4 } },
  { id: 1, name: 'TITAN', role: 'Heavy Assault', icon: '🦾', color: '#ff6644', hp: 150, shield: 60, spd: .85, special: 'GROUND SLAM', sdesc: 'Massive AoE explosion', stats: { HP: 5, SHIELD: 2, SPEED: 2, POWER: 5 } },
  { id: 2, name: 'WRAITH', role: 'Shadow Hunter', icon: '🌑', color: '#aa44ff', hp: 80, shield: 80, spd: 1.5, special: 'SHADOW STRIKE', sdesc: 'Teleport + triple crit', stats: { HP: 2, SHIELD: 3, SPEED: 5, POWER: 3 } },
  { id: 3, name: 'NOVA', role: 'Energy Caster', icon: '⚡', color: '#ffee00', hp: 100, shield: 100, spd: 1.1, special: 'LIGHTNING STORM', sdesc: 'Chain lightning all enemies', stats: { HP: 3, SHIELD: 4, SPEED: 4, POWER: 4 } },
];

export const BASE_WEP = [
  { id: 0, key: '1', name: 'ASSAULT', icon: '🔫', dmg: 7, rate: 14, ammo: 30, maxAmmo: 30, reload: 80, spd: 1.3, spread: .027, burst: 1, auto: false, color: 0xffcc44, size: .09 },
  { id: 1, key: '2', name: 'SHOTGUN', icon: '💥', dmg: 5, rate: 45, ammo: 8, maxAmmo: 8, reload: 110, spd: 1.0, spread: .14, burst: 7, auto: false, color: 0xff6600, size: .07 },
  { id: 2, key: '3', name: 'PLASMA', icon: '⚡', dmg: 11, rate: 23, ammo: 22, maxAmmo: 22, reload: 90, spd: 1.5, spread: .012, burst: 1, auto: true, color: 0x00ffff, size: .12 },
  { id: 3, key: '4', name: 'ROCKET', icon: '🚀', dmg: 38, rate: 90, ammo: 4, maxAmmo: 4, reload: 140, spd: .85, spread: .005, burst: 1, auto: false, color: 0xff2200, size: .19, explosive: true },
];

export const VT = [
  { name: 'HYDRA SCOUT', icon: '💧', phase: 'LEVEL 1 BOSS', shapeType: 'slim', col: 0x0077cc, emis: 0x002244, size: 1.3, hp: 280, spd: .022, atkRange: 22, projCol: 0x0099ff, projSpd: .32, rate: 100, reward: 300, dmgPerHit: 6 },
  { name: 'FOREST WRAITH', icon: '🌿', phase: 'LEVEL 2 BOSS', shapeType: 'tall', col: 0x226622, emis: 0x113311, size: 1.6, hp: 420, spd: .026, atkRange: 24, projCol: 0x44ff22, projSpd: .36, rate: 88, reward: 420, dmgPerHit: 8 },
  { name: 'FROST TITAN', icon: '🧊', phase: 'LEVEL 3 BOSS', shapeType: 'wide', col: 0x3388bb, emis: 0x224466, size: 2.0, hp: 560, spd: .02, atkRange: 26, projCol: 0x88ccff, projSpd: .34, rate: 95, reward: 560, dmgPerHit: 10 },
  { name: 'PHARAOH GOD', icon: '🔺', phase: 'LEVEL 4 BOSS', shapeType: 'armored', col: 0xdd9900, emis: 0x885500, size: 2.2, hp: 720, spd: .025, atkRange: 28, projCol: 0xffee00, projSpd: .4, rate: 82, reward: 720, dmgPerHit: 12 },
  { name: 'INFERNO KING', icon: '👹', phase: 'LEVEL 5 BOSS', shapeType: 'demon', col: 0xff1100, emis: 0xcc0000, size: 2.6, hp: 900, spd: .03, atkRange: 26, projCol: 0xff5500, projSpd: .44, rate: 70, reward: 900, dmgPerHit: 14 },
  { name: 'KRAKEN GOD', icon: '🌊', phase: 'FINAL BOSS', shapeType: 'kraken', col: 0x000088, emis: 0x000044, size: 3.1, hp: 1200, spd: .034, atkRange: 32, projCol: 0x0066ff, projSpd: .5, rate: 58, reward: 1500, dmgPerHit: 16 },
];

export const MINI_L4 = [
  { name: 'SAND SCARAB', col: 0xaa7700, size: .75, hp: 90, spd: .034, rate: 115, projCol: 0xffaa00, projSpd: .34, dmgPerHit: 5, shapeType: 'mini' },
  { name: 'DUNE SPAWN', col: 0x996600, size: .7, hp: 80, spd: .036, rate: 120, projCol: 0xffcc00, projSpd: .32, dmgPerHit: 5, shapeType: 'mini' },
  { name: 'TOMB SHADE', col: 0x885500, size: .72, hp: 85, spd: .033, rate: 118, projCol: 0xff9900, projSpd: .33, dmgPerHit: 5, shapeType: 'mini' },
];

export const MINI_L5 = [
  { name: 'FIRE SPAWN', col: 0xff2200, size: .75, hp: 80, spd: .036, rate: 110, projCol: 0xff4400, projSpd: .36, dmgPerHit: 6, shapeType: 'mini' },
  { name: 'LAVA SPRITE', col: 0xff5500, size: .7, hp: 70, spd: .038, rate: 108, projCol: 0xff6600, projSpd: .35, dmgPerHit: 6, shapeType: 'mini' },
  { name: 'EMBER FIEND', col: 0xff3300, size: .72, hp: 75, spd: .037, rate: 112, projCol: 0xff4400, projSpd: .34, dmgPerHit: 6, shapeType: 'mini' },
  { name: 'ASH WRAITH', col: 0xdd2200, size: .68, hp: 65, spd: .04, rate: 115, projCol: 0xff3300, projSpd: .36, dmgPerHit: 5, shapeType: 'mini' },
];

export const LEVELS = [
  { id: 0, name: 'RAINSTORM RUINS', sky: 0x0c1826, fog: 0x1a2d3d, fN: 10, fF: 60, gnd: 0x2a3d4a, amb: 0x334466, aI: .55, sun: 0x6699bb, sI: .9, part: 'rain', pc: 0x4477ff, villainIds: [0], minis: [] },
  { id: 1, name: 'ANCIENT FOREST', sky: 0x05100a, fog: 0x0d1f0d, fN: 7, fF: 48, gnd: 0x1a2e1a, amb: 0x1a3311, aI: .5, sun: 0x66cc44, sI: .75, part: 'leaves', pc: 0x44aa22, villainIds: [1], minis: [] },
  { id: 2, name: 'FROZEN TUNDRA', sky: 0x1a2444, fog: 0x8899bb, fN: 10, fF: 65, gnd: 0xd5e8ff, amb: 0x667799, aI: .8, sun: 0xbbddff, sI: 1.1, part: 'snow', pc: 0xffffff, villainIds: [2], minis: [] },
  { id: 3, name: 'SCORCHED DESERT', sky: 0x1a0c00, fog: 0xaa6622, fN: 12, fF: 70, gnd: 0xcc8833, amb: 0xaa5500, aI: .7, sun: 0xffcc44, sI: 1.5, part: 'sand', pc: 0xddaa44, villainIds: [3], minis: MINI_L4 },
  { id: 4, name: 'LAVA LANDS', sky: 0x110200, fog: 0x2a0800, fN: 6, fF: 42, gnd: 0x180800, amb: 0x880a00, aI: .6, sun: 0xff4400, sI: 1.3, part: 'embers', pc: 0xff3300, villainIds: [4], minis: MINI_L5 },
  { id: 5, name: 'THE VOID ARENA', sky: 0x010005, fog: 0x0a0014, fN: 5, fF: 40, gnd: 0x080014, amb: 0x110022, aI: .7, sun: 0x8800ff, sI: 1.1, part: 'void', pc: 0xaa44ff, villainIds: [0, 1, 2, 3, 4, 5], minis: [] },
];

export const MAP_META = [
  { icon: '🌧', col: '#4488cc', diff: 'EASY', diffCol: '#44cc44', feats: 'Rainy ruins • Long sight lines' },
  { icon: '🌿', col: '#44aa44', diff: 'EASY', diffCol: '#44cc44', feats: 'Dense forest • Tight corridors' },
  { icon: '❄️', col: '#88bbdd', diff: 'MEDIUM', diffCol: '#ffcc44', feats: 'Frozen tundra • Slippery ice' },
  { icon: '☀️', col: '#ddaa44', diff: 'MEDIUM', diffCol: '#ffcc44', feats: 'Desert heat • Mini-villains appear' },
  { icon: '🌋', col: '#ff4422', diff: 'HARD', diffCol: '#ff6644', feats: 'Lava terrain • Fire minions wave' },
  { icon: '🌀', col: '#8844ff', diff: 'EXTREME', diffCol: '#ff2244', feats: 'Void arena • ALL villains return' },
];

export const BGM_CONFIGS = [
  { bass: 55, drone: 110, tempo: 0.48, filt: 900, vol: 0.22, name: 'rain' },
  { bass: 41, drone: 82, tempo: 0.55, filt: 700, vol: 0.24, name: 'forest' },
  { bass: 49, drone: 98, tempo: 0.42, filt: 1200, vol: 0.20, name: 'snow' },
  { bass: 58, drone: 116, tempo: 0.52, filt: 1400, vol: 0.26, name: 'desert' },
  { bass: 37, drone: 74, tempo: 0.62, filt: 600, vol: 0.30, name: 'lava' },
  { bass: 31, drone: 62, tempo: 0.70, filt: 500, vol: 0.35, name: 'void' },
];

export const MENU_BGM = { bass: 46, drone: 92, tempo: 0.44, filt: 800, vol: 0.18, name: 'menu' };

export const UPG_POOL = [
  { id: 'dmg', icon: '⚔️', name: 'DAMAGE UP', desc: 'Weapons deal +10% damage' },
  { id: 'speed', icon: '👟', name: 'MOVE FASTER', desc: 'Movement speed +8%' },
  { id: 'shield', icon: '🛡', name: 'SHIELD BOOST', desc: '+15 max shield' },
  { id: 'reload', icon: '🔄', name: 'QUICK RELOAD', desc: 'Reload time -8%' },
  { id: 'special', icon: '⚡', name: 'POWER UP', desc: 'Special +18% damage' }
];
