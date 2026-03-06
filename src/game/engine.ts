import * as THREE from 'three';
import { CHARS, LEVELS, VT, BGM_CONFIGS, MENU_BGM } from './constants';
import {
  GS,
  UPG,
  P,
  K,
  InputState,
  weaps,
  sObj,
  partSys,
  enemies,
  ePrjs,
  pPrjs,
  vilQueue,
  vilIdx,
  setVilIdx,
  fr,
  resetGameState,
  setPartSys,
  incrementFr,
} from './state';
import { sfx, playBGM, stopBGM, audioEnabled } from './audio';

export class GameEngine {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  cam: THREE.PerspectiveCamera;
  ctx2d: CanvasRenderingContext2D;
  canvas3d: HTMLCanvasElement;
  canvas2d: HTMLCanvasElement;

  lastSpScore = 0;
  animationFrameId = 0;

  // Callbacks for UI updates
  onUpdateHUD?: () => void;
  onAnnounce?: (msg: string, col: string) => void;
  onKillfeed?: (msg: string, col: string) => void;
  onDamageNumber?: (x: number, y: number, dmg: number, isCrit: boolean) => void;
  onLevelComplete?: () => void;
  onDeath?: () => void;

  constructor(canvas3d: HTMLCanvasElement, canvas2d: HTMLCanvasElement) {
    this.canvas3d = canvas3d;
    this.canvas2d = canvas2d;
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 350);
    this.cam.position.set(0, 2, 5);
    this.cam.lookAt(0, 0, 0);

    this.ctx2d = canvas2d.getContext('2d')!;
    this.resize();

    window.addEventListener('resize', this.resize);
  }

  resize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.cam.aspect = window.innerWidth / window.innerHeight;
    this.cam.updateProjectionMatrix();
    this.canvas2d.width = window.innerWidth;
    this.canvas2d.height = window.innerHeight;
  };

  destroy() {
    window.removeEventListener('resize', this.resize);
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
  }

  clearScene() {
    sObj.forEach((o) => this.scene.remove(o));
    if (partSys) {
      this.scene.remove(partSys);
      setPartSys(null);
    }
    enemies.forEach((e) => this.scene.remove(e));
    ePrjs.forEach((p) => this.scene.remove(p.mesh));
    pPrjs.forEach((p) => this.scene.remove(p.mesh));
    resetGameState();
  }

  buildLevel(lvlIdx: number) {
    this.clearScene();
    const L = LEVELS[lvlIdx];
    this.renderer.setClearColor(L.sky);
    this.scene.fog = new THREE.Fog(L.fog, L.fN, L.fF);

    const amb = new THREE.AmbientLight(L.amb, L.aI);
    this.scene.add(amb);
    sObj.push(amb);

    const sun = new THREE.DirectionalLight(L.sun, L.sI);
    sun.position.set(25, 45, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -55;
    sun.shadow.camera.right = 55;
    sun.shadow.camera.top = 55;
    sun.shadow.camera.bottom = -55;
    sun.shadow.camera.far = 130;
    this.scene.add(sun);
    sObj.push(sun);

    if (lvlIdx === 4) {
      for (let i = 0; i < 5; i++) {
        const l = new THREE.PointLight(0xff3300, 2, 16);
        l.position.set(Math.cos((i / 5) * Math.PI * 2) * 18, 0.5, Math.sin((i / 5) * Math.PI * 2) * 18);
        this.scene.add(l);
        sObj.push(l);
      }
    }
    if (lvlIdx === 5) {
      const l = new THREE.PointLight(0x8800ff, 3, 50);
      l.position.set(0, 4, 0);
      this.scene.add(l);
      sObj.push(l);
    }

    const gnd = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.MeshStandardMaterial({ color: L.gnd, roughness: lvlIdx === 2 ? 0.45 : 0.97, metalness: lvlIdx === 5 ? 0.18 : 0 })
    );
    gnd.rotation.x = -Math.PI / 2;
    gnd.receiveShadow = true;
    this.scene.add(gnd);
    sObj.push(gnd);

    const grid = new THREE.GridHelper(90, 28, 0x111122, 0x0a0a16);
    grid.position.y = 0.01;
    this.scene.add(grid);
    sObj.push(grid);

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(260, 14, 10),
      new THREE.MeshBasicMaterial({ color: L.sky, side: THREE.BackSide })
    );
    this.scene.add(sky);
    sObj.push(sky);

    this.buildArena(L, lvlIdx);
    this.buildParticles(L);

    vilQueue.push(...L.villainIds.map((i) => {
      const v = { ...VT[i] };
      if (lvlIdx === 5) {
        v.hp = Math.floor(v.hp * 1.5);
        v.spd = v.spd * 1.2;
        v.rate = Math.floor(v.rate * 0.75);
        v.dmgPerHit = v.dmgPerHit + 5;
        v.phase = `RETURNS — ${i + 1}/6`;
      }
      return v;
    }));

    L.minis.forEach((m, i) => {
      const a = (i / L.minis.length) * Math.PI * 2;
      this.spawnEnemy({ ...m, isMini: true, phase: 'MINION', reward: 50, icon: '💀', atkRange: 20 }, Math.cos(a) * 13, Math.sin(a) * 13 - 6);
    });

    this.spawnNextVillain();

    const C = CHARS[GS.charIdx];
    P.maxHp = C.hp;
    P.hp = P.maxHp;
    P.maxShield = C.shield + UPG.shield * 15;
    P.shield = P.maxShield;
    P.dmgMult = 1 + UPG.dmg * 0.1;
    P.spdMult = C.spd * (1 + UPG.speed * 0.08);
    P.pos.set(0, 0.65, 13);
    P.yaw = Math.PI;
    P.pitch = 0;
    P.vel.set(0, 0, 0);
    P.alive = true;
    P.reloading = false;
    P.fireCd = 0;
    P.special = 0;
    P.spRdy = false;
    P.inv = 0;
    P.shRegen = 0;
    P.gunIdx = 0;
    
    this.lastSpScore = GS.score;

    if (this.onUpdateHUD) this.onUpdateHUD();
  }

  buildArena(L: any, lvlIdx: number) {
    const pm = new THREE.MeshStandardMaterial({ color: new THREE.Color(L.gnd).multiplyScalar(0.6), roughness: 0.95 });
    const bm = new THREE.MeshStandardMaterial({ color: new THREE.Color(L.gnd).multiplyScalar(0.38), roughness: 0.98 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2,
        r = 24;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.1, 6, 8), pm);
      p.position.set(Math.cos(a) * r, 3, Math.sin(a) * r);
      p.castShadow = true;
      this.scene.add(p);
      sObj.push(p);
    }
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2,
        r = 9 + Math.random() * 13,
        s = 0.7 + Math.random() * 0.7;
      const b = new THREE.Mesh(new THREE.BoxGeometry(s * 1.6, s, s * 1.6), bm);
      b.position.set(Math.cos(a) * r, s / 2, Math.sin(a) * r);
      b.rotation.y = Math.random() * Math.PI;
      b.castShadow = true;
      b.receiveShadow = true;
      this.scene.add(b);
      sObj.push(b);
    }
    if (lvlIdx === 5) {
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(8 + i * 7, 0.1, 8, 40),
          new THREE.MeshBasicMaterial({ color: 0x8800ff, transparent: true, opacity: 0.35 })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.05;
        this.scene.add(ring);
        sObj.push(ring);
      }
    }
  }

  buildParticles(L: any) {
    const cnt = L.part === 'rain' ? 650 : 320;
    const geo = new THREE.BufferGeometry();
    const pa = new Float32Array(cnt * 3),
      va = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {
      pa[i * 3] = (Math.random() - 0.5) * 65;
      pa[i * 3 + 1] = Math.random() * 22;
      pa[i * 3 + 2] = (Math.random() - 0.5) * 65;
      va[i * 3] = (Math.random() - 0.5) * 0.055;
      va[i * 3 + 1] = -(0.07 + Math.random() * 0.14);
      va[i * 3 + 2] = (Math.random() - 0.5) * 0.055;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pa, 3));
    geo.userData.v = va;
    const sys = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: L.pc,
        size: L.part === 'rain' ? 0.05 : L.part === 'snow' ? 0.12 : 0.08,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
      })
    );
    this.scene.add(sys);
    setPartSys(sys);
  }

  spawnNextVillain() {
    if (vilIdx >= vilQueue.length) return;
    const vd = vilQueue[vilIdx];
    setVilIdx(vilIdx + 1);
    const a = Math.random() * Math.PI * 2;
    this.spawnEnemy(vd, Math.cos(a) * 18, Math.sin(a) * 18 - 6);
    if (this.onKillfeed) this.onKillfeed(`${vd.icon || '👹'} ${vd.phase}: ${vd.name} APPEARS!`, '#ff2200');
    if (this.onAnnounce) this.onAnnounce(`${vd.icon || '👹'} ${vd.name}`, '#ff4400');
  }

  spawnEnemy(vd: any, x: number, z: number) {
    const grp = new THREE.Group();
    const s = vd.size || 1,
      t = vd.shapeType || 'slim';
    const bc = vd.col || 0xff0000,
      ec = vd.emis || 0x440000;
    const bm = new THREE.MeshStandardMaterial({ color: bc, emissive: ec, emissiveIntensity: 0.5, roughness: 0.65, metalness: 0.2 });
    const dm = new THREE.MeshStandardMaterial({ color: new THREE.Color(bc).multiplyScalar(0.4), emissive: ec, emissiveIntensity: 0.3, roughness: 0.5, metalness: 0.45 });
    const M = (g: any, m: any) => {
      const ms = new THREE.Mesh(g, m);
      ms.castShadow = true;
      return ms;
    };

    if (t === 'mini') {
      const body = M(new THREE.CylinderGeometry(0.3 * s, 0.38 * s, 1.4 * s, 7), bm);
      body.position.y = 0.7 * s;
      grp.add(body);
      const head = M(new THREE.SphereGeometry(0.28 * s, 7, 6), bm);
      head.position.y = 1.6 * s;
      grp.add(head);
    } else if (t === 'slim') {
      const body = M(new THREE.CylinderGeometry(0.33 * s, 0.48 * s, 2.6 * s, 8), bm);
      body.position.y = 1.3 * s;
      grp.add(body);
      const fin = M(new THREE.BoxGeometry(0.07 * s, 1.7 * s, 0.65 * s), bm);
      fin.position.set(0, 1.8 * s, -0.38 * s);
      grp.add(fin);
      const head = M(new THREE.SphereGeometry(0.44 * s, 8, 6), bm);
      head.position.y = 3.0 * s;
      grp.add(head);
      for (let i = 0; i < 5; i++) {
        const sp = M(new THREE.ConeGeometry(0.07 * s, 0.4 * s, 5), bm);
        sp.position.set(Math.cos((i / 5) * Math.PI * 2) * 0.33 * s, 3.42 * s, Math.sin((i / 5) * Math.PI * 2) * 0.33 * s);
        grp.add(sp);
      }
    } else if (t === 'tall') {
      const body = M(new THREE.CylinderGeometry(0.38 * s, 0.58 * s, 3.1 * s, 7), bm);
      body.position.y = 1.55 * s;
      grp.add(body);
      const head = M(new THREE.SphereGeometry(0.48 * s, 7, 6), bm);
      head.position.y = 3.4 * s;
      grp.add(head);
      for (let i = 0; i < 4; i++) {
        const br = M(new THREE.CylinderGeometry(0.055 * s, 0.09 * s, 0.88 * s, 5), bm);
        br.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.72;
        br.position.set((i < 2 ? 1 : -1) * 0.58 * s, 2.1 * s + i * 0.2 * s, 0);
        grp.add(br);
      }
      const lroot = M(new THREE.CylinderGeometry(0.08 * s, 0.14 * s, 0.6 * s, 6), bm);
      lroot.position.set(0, 0.35 * s, 0.3 * s);
      lroot.rotation.x = 0.4;
      grp.add(lroot);
    } else if (t === 'wide') {
      const body = M(new THREE.BoxGeometry(1.35 * s, 1.75 * s, 1.15 * s), bm);
      body.position.y = 0.88 * s;
      grp.add(body);
      const head = M(new THREE.BoxGeometry(1.05 * s, 0.95 * s, 0.95 * s), bm);
      head.position.y = 2.3 * s;
      grp.add(head);
      for (let i = 0; i < 6; i++) {
        const sp = M(new THREE.ConeGeometry(0.11 * s, 0.55 * s, 5), bm);
        sp.position.set(Math.cos((i / 6) * Math.PI * 2) * 0.75 * s, 2.65 * s, Math.sin((i / 6) * Math.PI * 2) * 0.75 * s);
        grp.add(sp);
      }
      [-1, 1].forEach((side) => {
        const sh = M(new THREE.BoxGeometry(0.52 * s, 0.52 * s, 0.68 * s), dm);
        sh.position.set(side * 0.92 * s, 1.75 * s, 0);
        grp.add(sh);
      });
    } else if (t === 'armored') {
      const body = M(new THREE.CylinderGeometry(0.52 * s, 0.66 * s, 2.3 * s, 6), bm);
      body.position.y = 1.15 * s;
      grp.add(body);
      const chest = M(new THREE.BoxGeometry(1.25 * s, 0.85 * s, 0.68 * s), dm);
      chest.position.y = 1.75 * s;
      grp.add(chest);
      const head = M(new THREE.BoxGeometry(0.82 * s, 1.15 * s, 0.82 * s), bm);
      head.position.y = 3.05 * s;
      grp.add(head);
      const crown = M(new THREE.CylinderGeometry(0.14 * s, 0.58 * s, 0.75 * s, 4), bm);
      crown.position.y = 3.78 * s;
      grp.add(crown);
      for (let i = 0; i < 3; i++) {
        const cp = M(new THREE.BoxGeometry(0.24 * s, 0.75 * s, 0.06 * s), dm);
        cp.position.set((i - 1) * 0.28 * s, 0.88 * s, -0.58 * s);
        grp.add(cp);
      }
      [-1, 1].forEach((side) => {
        const sp = M(new THREE.ConeGeometry(0.1 * s, 0.5 * s, 5), bm);
        sp.position.set(side * 0.5 * s, 2.95 * s, 0);
        sp.rotation.z = side * -0.25;
        grp.add(sp);
      });
    } else if (t === 'demon') {
      const body = M(new THREE.CylinderGeometry(0.68 * s, 0.88 * s, 2.75 * s, 10), bm);
      body.position.y = 1.38 * s;
      grp.add(body);
      [-1, 1].forEach((side) => {
        const sh = M(new THREE.BoxGeometry(0.62 * s, 0.52 * s, 0.88 * s), dm);
        sh.position.set(side * 1.0 * s, 2.18 * s, 0);
        grp.add(sh);
        const wing = M(new THREE.BoxGeometry(0.09 * s, 1.55 * s, 1.55 * s), dm);
        wing.position.set(side * 1.48 * s, 2.38 * s, 0);
        wing.rotation.z = side * 0.38;
        grp.add(wing);
        const wt = M(new THREE.ConeGeometry(0.12 * s, 0.5 * s, 5), bm);
        wt.position.set(side * 1.55 * s, 3.2 * s, -0.5 * s);
        wt.rotation.z = side * 0.6;
        wt.rotation.x = 0.3;
        grp.add(wt);
      });
      const head = M(new THREE.SphereGeometry(0.62 * s, 9, 7), bm);
      head.position.y = 3.45 * s;
      grp.add(head);
      [-1, 1].forEach((side) => {
        const h = M(new THREE.ConeGeometry(0.14 * s, 0.88 * s, 5), bm);
        h.position.set(side * 0.38 * s, 4.05 * s, 0);
        h.rotation.z = side * -0.28;
        grp.add(h);
      });
      const tail = M(new THREE.CylinderGeometry(0.07 * s, 0.18 * s, 1.15 * s, 6), bm);
      tail.rotation.x = -0.9;
      tail.position.set(0, 0.48 * s, 0.78 * s);
      grp.add(tail);
      const tailtip = M(new THREE.ConeGeometry(0.12 * s, 0.35 * s, 5), bm);
      tailtip.rotation.x = -0.9;
      tailtip.position.set(0, 0.05 * s, 1.4 * s);
      grp.add(tailtip);
    } else if (t === 'kraken') {
      const body = M(new THREE.SphereGeometry(1.05 * s, 10, 8), bm);
      body.position.y = 1.75 * s;
      grp.add(body);
      const head = M(new THREE.SphereGeometry(0.88 * s, 9, 7), bm);
      head.position.y = 3.4 * s;
      grp.add(head);
      const crest = M(new THREE.ConeGeometry(0.5 * s, 0.7 * s, 6), bm);
      crest.position.y = 4.18 * s;
      grp.add(crest);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2,
          r = 1.18 * s;
        const ten = M(new THREE.CylinderGeometry(0.07 * s, 0.2 * s, 1.75 * s, 6), bm);
        ten.rotation.z = Math.cos(a) * 0.78;
        ten.rotation.x = Math.sin(a) * 0.78;
        ten.position.set(Math.cos(a) * r, 0.78 * s, Math.sin(a) * r);
        grp.add(ten);
      }
    }

    [-1, 1].forEach((side) => {
      const eyeY =
        t === 'wide' ? 2.42 * s : t === 'slim' ? 3.04 * s : t === 'kraken' ? 3.48 * s : t === 'armored' ? 3.06 * s : t === 'demon' ? 3.48 * s : t === 'mini' ? 1.65 * s : 3.0 * s;
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09 * s, 5, 5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      eye.position.set(side * 0.2 * s, eyeY, 0.48 * s);
      grp.add(eye);
      const el = new THREE.PointLight(0xff0000, 1.1, 3.5 * s);
      el.position.copy(eye.position);
      grp.add(el);
    });

    if (t !== 'mini') {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11 * s, 0.17 * s, 1.35 * s, 6),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, emissive: ec, emissiveIntensity: 0.2, roughness: 0.4, metalness: 0.75 })
      );
      arm.rotation.z = -Math.PI / 2.2;
      arm.position.set(-1.05 * s, 1.55 * s, 0.1 * s);
      arm.castShadow = true;
      grp.add(arm);
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065 * s, 0.065 * s, 0.5 * s, 5),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.18, metalness: 0.92 })
      );
      barrel.rotation.z = -Math.PI / 2;
      barrel.position.set(-1.7 * s, 1.55 * s, 0.1 * s);
      grp.add(barrel);
      [-1, 1].forEach((side) => {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.23 * s, 0.19 * s, 1.05 * s, 6),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(bc).multiplyScalar(0.5), roughness: 0.78 })
        );
        leg.position.set(side * 0.3 * s, 0.52 * s, 0);
        grp.add(leg);
      });
    }

    const glow = new THREE.PointLight(ec || bc, 2.5, 10 * s);
    glow.position.y = 2 * s;
    grp.add(glow);

    grp.position.set(x, 0, z);
    grp.userData = {
      alive: true,
      isMini: vd.isMini || false,
      hp: vd.hp,
      maxHp: vd.hp,
      spd: vd.spd || 0.025,
      fireCd: Math.floor(Math.random() * 50) + 10,
      fireRate: vd.rate || 100,
      atkRange: vd.atkRange || 22,
      projCol: vd.projCol || 0xff4400,
      projSpd: vd.projSpd || 0.36,
      dmgPerHit: vd.dmgPerHit || 8,
      bobT: Math.random() * Math.PI * 2,
      hitFlash: 0,
      name: vd.name,
      icon: vd.icon || '👹',
      phase: vd.phase || '',
      reward: vd.reward || 50,
      def: vd,
    };
    this.scene.add(grp);
    enemies.push(grp);
    if (this.onUpdateHUD) this.onUpdateHUD();
    return grp;
  }

  updPlayer() {
    if (!P.alive) return;
    const sprint = K.ShiftLeft || K.ShiftRight;
    const spd = (sprint ? 0.14 : 0.08) * P.spdMult;
    const d = new THREE.Vector3();
    if (K.KeyW || K.ArrowUp) d.z -= 1;
    if (K.KeyS || K.ArrowDown) d.z += 1;
    if (K.KeyA || K.ArrowLeft) d.x -= 1;
    if (K.KeyD || K.ArrowRight) d.x += 1;
    if (d.length() > 0) {
      d.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), P.yaw);
      P.vel.x = d.x * spd;
      P.vel.z = d.z * spd;
    } else {
      P.vel.x *= 0.76;
      P.vel.z *= 0.76;
    }
    if (K.Space && P.onGround) {
      P.vel.y = 0.18;
      P.onGround = false;
    }
    P.vel.y -= 0.012;
    P.pos.add(P.vel);
    if (P.pos.y <= 0.65) {
      P.pos.y = 0.65;
      P.vel.y = 0;
      P.onGround = true;
    }
    const B = 40;
    P.pos.x = Math.max(-B, Math.min(B, P.pos.x));
    P.pos.z = Math.max(-B, Math.min(B, P.pos.z));
    if (P.inv > 0) P.inv--;
    P.shRegen++;
    if (P.shRegen > 130 && P.shield < P.maxShield) P.shield = Math.min(P.maxShield, P.shield + 0.22);
    if (P.fireCd > 0) P.fireCd--;
    this.cam.position.copy(P.pos);
    this.cam.position.y += 0.38;
    this.cam.rotation.order = 'YXZ';
    this.cam.rotation.y = P.yaw;
    this.cam.rotation.x = P.pitch;
  }

  shoot() {
    if (!GS.active || !P.alive) return;
    const g = weaps[P.gunIdx];
    if (P.reloading || P.fireCd > 0) return;
    if (g.curAmmo <= 0) {
      this.startReload();
      return;
    }
    P.fireCd = g.rate;
    g.curAmmo--;
    if (this.onUpdateHUD) this.onUpdateHUD();
    sfx.shoot(P.gunIdx);
    for (let b = 0; b < g.burst; b++) {
      const sx = (Math.random() - 0.5) * g.spread * 2,
        sy = (Math.random() - 0.5) * g.spread * 2;
      let dir;
      if (InputState.locked) {
        dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(P.pitch + sy, P.yaw + sx, 0, 'YXZ')).normalize();
      } else {
        const nx = (InputState.xhx / window.innerWidth) * 2 - 1,
          ny = -((InputState.xhy / window.innerHeight) * 2 - 1);
        dir = new THREE.Vector3(nx + sx, ny + sy, -1).unproject(this.cam).sub(this.cam.position).normalize();
      }
      const orig = this.cam.position.clone().addScaledVector(dir, 0.55);
      const col = g.color || 0xffcc44;
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(g.size || 0.09, 6, 4), new THREE.MeshBasicMaterial({ color: col }));
      mesh.position.copy(orig);
      const pl = new THREE.PointLight(col, 1.4, 3);
      mesh.add(pl);
      this.scene.add(mesh);
      pPrjs.push({ mesh, dir: dir.clone(), spd: g.spd || 1, dmg: (g.dmg || 8) * P.dmgMult, life: 0, maxLife: 170, explosive: g.explosive || false, col });
    }
    InputState.xhfl = 8;
    InputState.xhcr = false;
  }

  startReload() {
    const g = weaps[P.gunIdx];
    if (g.curAmmo === g.maxAmmo || P.reloading) return;
    P.reloading = true;
    P.reloadT = 0;
    if (this.onUpdateHUD) this.onUpdateHUD();
    sfx.reload();
  }

  updReload() {
    if (!P.reloading) return;
    const g = weaps[P.gunIdx];
    const rt = g.reload * (1 - UPG.reload * 0.08);
    P.reloadT++;
    if (this.onUpdateHUD) this.onUpdateHUD();
    if (P.reloadT >= rt) {
      P.reloading = false;
      g.curAmmo = g.maxAmmo;
      if (this.onUpdateHUD) this.onUpdateHUD();
    }
  }

  swGun(i: number) {
    if (i === P.gunIdx || P.reloading) return;
    P.gunIdx = i;
    P.fireCd = 0;
    if (this.onUpdateHUD) this.onUpdateHUD();
  }

  chargeSp(dmg: number) {
    if (P.spRdy) return;
    const milestone = Math.floor(GS.score / 400);
    const lastMilestone = Math.floor(this.lastSpScore / 400);
    if (milestone > lastMilestone) {
      P.special = P.maxSpecial;
      P.spRdy = true;
      this.lastSpScore = GS.score;
      if (this.onUpdateHUD) this.onUpdateHUD();
      return;
    }
    P.special = Math.min(P.maxSpecial, P.special + dmg * 0.08);
    if (P.special >= P.maxSpecial) {
      P.spRdy = true;
      this.lastSpScore = GS.score;
    }
    if (this.onUpdateHUD) this.onUpdateHUD();
  }

  useSpecial() {
    if (!P.spRdy || !GS.active || !P.alive) return;
    P.special = 0;
    P.spRdy = false;
    this.lastSpScore = GS.score;
    if (this.onUpdateHUD) this.onUpdateHUD();
    const C = CHARS[GS.charIdx];
    
    // Trigger screen flash (we can do this via DOM in React, or just ignore for now)
    const sov = document.getElementById('sov');
    if (sov) {
      sov.style.opacity = '1';
      setTimeout(() => (sov.style.opacity = '0'), 600);
    }

    if (this.onAnnounce) this.onAnnounce(`⚡ ${C.special}!`, C.color);
    if (this.onKillfeed) this.onKillfeed(`⚡ ${C.special} ACTIVATED!`, C.color);
    sfx.special();
    
    const bd = 180 * (1 + UPG.special * 0.22);
    if (C.id === 0) {
      let shots = 0;
      const iv = setInterval(() => {
        if (shots >= 10 || !GS.active) {
          clearInterval(iv);
          return;
        }
        const sa = (Math.random() - 0.5) * 0.07;
        const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(P.pitch, P.yaw + sa, 0, 'YXZ')).normalize();
        const orig = this.cam.position.clone().addScaledVector(dir, 0.5);
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 4), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        mesh.position.copy(orig);
        const pl = new THREE.PointLight(0x00ffff, 2, 4);
        mesh.add(pl);
        this.scene.add(mesh);
        pPrjs.push({ mesh, dir: dir.clone(), spd: 2.2, dmg: bd / 10, life: 0, maxLife: 180, explosive: false, col: 0x00ffff });
        shots++;
      }, 45);
    } else if (C.id === 1) {
      enemies.forEach((e) => {
        if (!e.userData.alive) return;
        const d = P.pos.distanceTo(e.position);
        if (d < 28) this.hitEnemy(e, bd * (1.2 - d / 30), true);
      });
      this.explFX(P.pos.clone(), 5, 0xff6600);
      this.explFX(P.pos.clone(), 3, 0xffaa00);
    } else if (C.id === 2) {
      const alv = enemies.filter((e) => e.userData.alive).sort((a, b) => a.position.distanceTo(P.pos) - b.position.distanceTo(P.pos));
      if (alv.length) {
        const tgt = alv[0];
        P.pos.copy(tgt.position).addScaledVector(new THREE.Vector3(0, 0, 1), 3.5);
        for (let i = 0; i < 5; i++)
          setTimeout(() => {
            if (tgt.userData.alive) this.hitEnemy(tgt, bd / 5, true);
          }, i * 80);
      }
    } else if (C.id === 3) {
      enemies.forEach((e, i) => {
        if (!e.userData.alive) return;
        setTimeout(() => {
          if (e.userData.alive) this.hitEnemy(e, bd * 0.75, true);
        }, i * 60);
        this.lightFX(P.pos.clone(), e.position.clone());
      });
    }
  }

  explFX(pos: THREE.Vector3, r: number, col: number) {
    for (let i = 0; i < 18; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.13, 4, 4), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 1 }));
      s.position.copy(pos);
      const v = new THREE.Vector3((Math.random() - 0.5) * r, Math.random() * r * 0.8, (Math.random() - 0.5) * r);
      this.scene.add(s);
      let l = 0;
      const a = () => {
        s.position.add(v);
        v.y -= 0.035;
        l++;
        s.material.opacity = 1 - l / 22;
        if (l < 22) requestAnimationFrame(a);
        else this.scene.remove(s);
      };
      a();
    }
  }

  lightFX(from: THREE.Vector3, to: THREE.Vector3) {
    const len = from.distanceTo(to);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.023, len, 4), new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.82 }));
    const mid = from.clone().add(to).multiplyScalar(0.5);
    mid.y += 0.4;
    mesh.position.copy(mid);
    mesh.lookAt(to);
    mesh.rotateX(Math.PI / 2);
    this.scene.add(mesh);
    setTimeout(() => this.scene.remove(mesh), 280);
  }

  updEnemies() {
    enemies.forEach((e) => {
      if (!e.userData.alive) return;
      const U = e.userData;
      const dx = P.pos.x - e.position.x,
        dz = P.pos.z - e.position.z,
        dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 5) {
        e.position.x += (dx / dist) * U.spd;
        e.position.z += (dz / dist) * U.spd;
      }
      e.rotation.y = Math.atan2(dx, dz);
      U.bobT += 0.026;
      e.position.y = Math.sin(U.bobT) * 0.14 * (U.def.size || 1);
      if (U.hitFlash > 0) {
        e.traverse((c: any) => {
          if (c.isMesh && c.material && c.material.emissiveIntensity !== undefined) c.material.emissiveIntensity = 2.2;
        });
        U.hitFlash--;
      } else {
        e.traverse((c: any) => {
          if (c.isMesh && c.material && c.material.emissiveIntensity > 1.5) c.material.emissiveIntensity = 0.5;
        });
      }
      U.fireCd--;
      if (U.fireCd <= 0 && dist < U.atkRange) {
        U.fireCd = U.fireRate;
        const orig = e.position.clone();
        orig.y += 2.2 * (U.def.size || 1);
        const playerTarget = P.pos.clone();
        playerTarget.y += 0.65;
        const dir = new THREE.Vector3().subVectors(playerTarget, orig).normalize();
        dir.x += (Math.random() - 0.5) * 0.06;
        dir.z += (Math.random() - 0.5) * 0.06;
        dir.normalize();
        const col = U.projCol || 0xff4400;
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 4), new THREE.MeshBasicMaterial({ color: col }));
        mesh.position.copy(orig);
        const pl = new THREE.PointLight(col, 1.5, 5);
        mesh.add(pl);
        this.scene.add(mesh);
        ePrjs.push({ mesh, dir, spd: (U.projSpd || 0.36) * 1.35, dmg: U.dmgPerHit || 8, life: 0, maxLife: 220 });
      }
    });
  }

  updProjectiles() {
    for (let i = pPrjs.length - 1; i >= 0; i--) {
      const p = pPrjs[i];
      p.mesh.position.addScaledVector(p.dir, p.spd);
      p.life++;
      let hit = false;
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (!e.userData.alive) continue;
        if (p.mesh.position.distanceTo(e.position) < 1.65 * (e.userData.def.size || 1)) {
          this.hitEnemy(e, p.dmg * (p.explosive ? 2 : 1), false);
          if (p.explosive) this.explFX(p.mesh.position.clone(), 2.2, 0xff4400);
          hit = true;
          break;
        }
      }
      if (hit || p.life > p.maxLife) {
        this.scene.remove(p.mesh);
        pPrjs.splice(i, 1);
      }
    }
    for (let i = ePrjs.length - 1; i >= 0; i--) {
      const p = ePrjs[i];
      p.mesh.position.addScaledVector(p.dir, p.spd);
      p.life++;
      if (p.mesh.position.distanceTo(P.pos) < 0.8 && P.alive && P.inv <= 0) {
        this.dmgPlayer(p.dmg);
        this.scene.remove(p.mesh);
        ePrjs.splice(i, 1);
        continue;
      }
      if (p.life > p.maxLife) {
        this.scene.remove(p.mesh);
        ePrjs.splice(i, 1);
      }
    }
  }

  hitEnemy(e: any, dmg: number, isCrit: boolean) {
    if (!e.userData.alive) return;
    e.userData.hp -= dmg;
    e.userData.hitFlash = 5;
    GS.score += Math.round(dmg);
    if (this.onUpdateHUD) this.onUpdateHUD();
    this.chargeSp(dmg);
    InputState.xhfl = 10;
    InputState.xhcr = isCrit;

    const wp = e.position.clone();
    wp.y += 3 * (e.userData.def.size || 1);
    const sv2 = wp.clone().project(this.cam);
    const sx = (sv2.x * 0.5 + 0.5) * window.innerWidth,
      sy = (1 - (sv2.y * 0.5 + 0.5)) * window.innerHeight;
    
    if (this.onDamageNumber) this.onDamageNumber(sx, sy, dmg, isCrit);

    if (e.userData.hp <= 0) {
      e.userData.alive = false;
      if (this.onKillfeed) this.onKillfeed(`☠ ${e.userData.name} DESTROYED! +${e.userData.reward}`, '#ffaa00');
      GS.score += e.userData.reward;
      if (this.onUpdateHUD) this.onUpdateHUD();
      this.explFX(e.position.clone(), (e.userData.def.size || 1) * 2.5, e.userData.projCol || 0xff4400);
      sfx.enemyDie();
      this.scene.remove(e);
      const idx = enemies.indexOf(e);
      if (idx >= 0) enemies.splice(idx, 1);

      if (!e.userData.isMini) {
        setTimeout(() => {
          if (vilIdx < vilQueue.length) {
            this.spawnNextVillain();
          } else {
            const alive = enemies.filter((ex) => ex.userData.alive);
            if (alive.length === 0) setTimeout(() => this.levelComplete(), 1200);
          }
          if (this.onUpdateHUD) this.onUpdateHUD();
        }, 900);
      } else {
        const alive = enemies.filter((ex) => ex.userData.alive);
        if (alive.length === 0 && vilIdx >= vilQueue.length) setTimeout(() => this.levelComplete(), 1200);
        if (this.onUpdateHUD) this.onUpdateHUD();
      }
    }
  }

  dmgPlayer(dmg: number) {
    P.shRegen = 0;
    P.inv = 28;
    if (P.shield > 0) {
      const abs = Math.min(P.shield, dmg);
      P.shield -= abs;
      dmg -= abs;
    }
    if (dmg > 0) P.hp = Math.max(0, P.hp - dmg);
    if (this.onUpdateHUD) this.onUpdateHUD();
    
    const vgn = document.getElementById('vgn');
    if (vgn) {
      vgn.style.opacity = '1';
      setTimeout(() => (vgn.style.opacity = '0'), 140);
    }
    sfx.playerHit();
    if (P.hp <= 0) {
      P.alive = false;
      setTimeout(() => this.showDeath(), 1000);
    }
  }

  updParticles() {
    if (!partSys) return;
    const pa = partSys.geometry.attributes.position as THREE.BufferAttribute;
    const va = partSys.geometry.userData.v;
    for (let i = 0; i < pa.count; i++) {
      pa.array[i * 3] += va[i * 3];
      pa.array[i * 3 + 1] += va[i * 3 + 1];
      pa.array[i * 3 + 2] += va[i * 3 + 2];
      if (pa.array[i * 3 + 1] < 0) {
        pa.array[i * 3] = P.pos.x + (Math.random() - 0.5) * 55;
        pa.array[i * 3 + 1] = 18 + Math.random() * 4;
        pa.array[i * 3 + 2] = P.pos.z + (Math.random() - 0.5) * 55;
      }
    }
    pa.needsUpdate = true;
  }

  drawXH() {
    this.ctx2d.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
    if (!GS.active) return;
    const x = InputState.xhx,
      y = InputState.xhy,
      g = 8,
      l = 13;
    const col = InputState.xhfl > 0 ? (InputState.xhcr ? 'rgba(255,50,50,.95)' : 'rgba(255,100,60,.95)') : 'rgba(255,200,60,.85)';
    this.ctx2d.strokeStyle = col;
    this.ctx2d.lineWidth = 2;
    this.ctx2d.lineCap = 'round';
    this.ctx2d.shadowColor = col;
    this.ctx2d.shadowBlur = InputState.xhfl > 0 ? 12 : 4;
    [
      [x - g - l, y, x - g, y],
      [x + g, y, x + g + l, y],
      [x, y - g - l, x, y - g],
      [x, y + g, x, y + g + l],
    ].forEach(([x1, y1, x2, y2]) => {
      this.ctx2d.beginPath();
      this.ctx2d.moveTo(x1, y1);
      this.ctx2d.lineTo(x2, y2);
      this.ctx2d.stroke();
    });
    this.ctx2d.fillStyle = InputState.xhfl > 0 ? '#ff4422' : '#ffcc44';
    this.ctx2d.shadowBlur = 8;
    this.ctx2d.beginPath();
    this.ctx2d.arc(x, y, 2.5, 0, Math.PI * 2);
    this.ctx2d.fill();
    this.ctx2d.shadowBlur = 0;
    if (InputState.xhfl > 0) InputState.xhfl--;
  }

  drawMM() {
    const mmc = document.getElementById('mmc') as HTMLCanvasElement;
    if (!mmc) return;
    const mmctx = mmc.getContext('2d');
    if (!mmctx) return;
    mmctx.clearRect(0, 0, 118, 118);
    mmctx.fillStyle = 'rgba(0,0,0,.82)';
    mmctx.beginPath();
    mmctx.arc(59, 59, 59, 0, Math.PI * 2);
    mmctx.fill();
    const sc = 1.35;
    enemies.forEach((e) => {
      if (!e.userData.alive) return;
      const ex = (e.position.x - P.pos.x) * sc + 59,
        ez = (e.position.z - P.pos.z) * sc + 59;
      if (ex < 4 || ex > 114 || ez < 4 || ez > 114) return;
      mmctx.fillStyle = e.userData.isMini ? '#ff8800' : '#ff2200';
      mmctx.beginPath();
      mmctx.arc(ex, ez, e.userData.isMini ? 3 : 5, 0, Math.PI * 2);
      mmctx.fill();
    });
    mmctx.fillStyle = '#fff';
    mmctx.beginPath();
    mmctx.arc(59, 59, 4.5, 0, Math.PI * 2);
    mmctx.fill();
    mmctx.save();
    mmctx.translate(59, 59);
    mmctx.rotate(P.yaw + Math.PI);
    mmctx.fillStyle = CHARS[GS.charIdx]?.color || '#00c8ff';
    mmctx.beginPath();
    mmctx.moveTo(0, -9);
    mmctx.lineTo(-4, 5);
    mmctx.lineTo(4, 5);
    mmctx.closePath();
    mmctx.fill();
    mmctx.restore();
    mmctx.globalCompositeOperation = 'destination-in';
    mmctx.beginPath();
    mmctx.arc(59, 59, 57, 0, Math.PI * 2);
    mmctx.fill();
    mmctx.globalCompositeOperation = 'source-over';
  }

  startLevel(lvlIdx: number) {
    GS.level = lvlIdx;
    GS.score = 0;
    GS.active = true;
    this.buildLevel(lvlIdx);
    
    if (this.onAnnounce) this.onAnnounce(`LEVEL ${lvlIdx + 1}<br>${LEVELS[lvlIdx].name}`, '#ff9900');
    sfx.levelStart();
    if (audioEnabled) setTimeout(() => playBGM(BGM_CONFIGS[lvlIdx] || BGM_CONFIGS[0]), 400);
  }

  levelComplete() {
    GS.active = false;
    document.exitPointerLock();
    if (GS.level + 1 < LEVELS.length) GS.unlocked = Math.max(GS.unlocked, GS.level + 2);
    stopBGM();
    sfx.victory();
    if (this.onLevelComplete) this.onLevelComplete();
  }

  showDeath() {
    GS.active = false;
    document.exitPointerLock();
    stopBGM();
    sfx.playerDie();
    if (this.onDeath) this.onDeath();
  }

  loop = () => {
    this.animationFrameId = requestAnimationFrame(this.loop);
    incrementFr();
    if (GS.active) {
      this.updPlayer();
      this.updReload();
      this.updEnemies();
      this.updProjectiles();
      this.updParticles();
      if (InputState.mleft && weaps[P.gunIdx]?.auto && P.fireCd <= 0) this.shoot();
      if (fr % 2 === 0 && this.onUpdateHUD) this.onUpdateHUD();
      if (fr % 3 === 0) this.drawMM();
    }
    this.drawXH();
    this.renderer.render(this.scene, this.cam);
  };
}
