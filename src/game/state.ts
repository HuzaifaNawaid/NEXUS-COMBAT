import * as THREE from 'three';
import { BASE_WEP } from './constants';

export const GS = {
  screen: 'menu',
  level: 0,
  unlocked: 1,
  score: 0,
  active: false,
  charIdx: 0,
};

export const UPG = {
  dmg: 0,
  speed: 0,
  shield: 0,
  reload: 0,
  special: 0,
};

export const P = {
  hp: 100,
  maxHp: 100,
  shield: 100,
  maxShield: 100,
  pos: new THREE.Vector3(0, 0.65, 10),
  vel: new THREE.Vector3(),
  yaw: Math.PI,
  pitch: 0,
  onGround: true,
  gunIdx: 0,
  fireCd: 0,
  reloading: false,
  reloadT: 0,
  special: 0,
  maxSpecial: 100,
  spRdy: false,
  alive: true,
  inv: 0,
  shRegen: 0,
  dmgMult: 1,
  spdMult: 1,
};

export const K: Record<string, boolean> = {};
export const InputState = {
  mleft: false,
  locked: false,
  xhx: window.innerWidth / 2,
  xhy: window.innerHeight / 2,
  xhfl: 0,
  xhcr: false,
};

export let weaps = BASE_WEP.map((w) => ({ ...w, curAmmo: w.maxAmmo }));
export let sObj: THREE.Object3D[] = [];
export let partSys: THREE.Points | null = null;
export let enemies: THREE.Group[] = [];
export let ePrjs: any[] = [];
export let pPrjs: any[] = [];
export let vilQueue: any[] = [];
export let vilIdx = 0;

export function setVilIdx(val: number) {
  vilIdx = val;
}
export let fr = 0;

export function resetGameState() {
  weaps = BASE_WEP.map((w) => ({ ...w, curAmmo: w.maxAmmo }));
  sObj = [];
  partSys = null;
  enemies = [];
  ePrjs = [];
  pPrjs = [];
  vilQueue = [];
  vilIdx = 0;
  fr = 0;
}

export function setPartSys(sys: THREE.Points | null) {
  partSys = sys;
}

export function incrementFr() {
  fr++;
}
