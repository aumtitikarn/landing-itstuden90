'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

/* โทนเดียวกับเว็บ — ตัวเครื่องสีครีมแบบคอมยุค 90 จอฟอสฟอร์สีอำพัน */
const BEIGE = '#E7DDC4';
const BEIGE_DARK = '#CFC2A3';
const KEYCAP = '#F2EAD8';
const AMBER = '#FFB938';

/* จังหวะการพิมพ์ (วินาที) — สุ่มเพิ่มเล็กน้อยทุกตัวอักษรให้ดูเหมือนคนพิมพ์ */
const START_DELAY = 0.45;
const NAME_CHAR = 0.075;
const DESC_CHAR = 0.038;
const JITTER = 0.05;
const ENTER_PAUSE = 0.3;
const HOLD = 2.4;
const ERASE_CHAR = 0.016;

/* ---------- คีย์บอร์ด: แถวละ 15 หน่วยตามคีย์บอร์ดจริง ---------- */
const U = 0.16;
const KEY_H = 0.06;
const KEY_REST = 0.1 + KEY_H / 2 + 0.004;
const ROWS: number[][] = [
  [...Array<number>(13).fill(1), 2],
  [1.5, ...Array<number>(12).fill(1), 1.5],
  [1.75, ...Array<number>(11).fill(1), 2.25],
  [2.25, ...Array<number>(10).fill(1), 2.75],
  [1.5, 1.5, 1.5, 6, 1.5, 1.5, 1.5],
];

type KeyDef = { x: number; z: number; w: number; mod: boolean };
const KEYS: KeyDef[] = [];
const LETTERS: number[] = [];
let BACKSPACE = 0;
let ENTER = 0;
let SPACE = 0;
ROWS.forEach((row, r) => {
  let x = -7.5 * U;
  row.forEach((w, i) => {
    const idx = KEYS.length;
    KEYS.push({ x: x + (w * U) / 2, z: (r - 2) * U, w, mod: w !== 1 && w !== 6 });
    if (w === 1) LETTERS.push(idx);
    if (w === 6) SPACE = idx;
    if (r === 0 && i === row.length - 1) BACKSPACE = idx;
    if (r === 2 && i === row.length - 1) ENTER = idx;
    x += w * U;
  });
});

/* ตัวอักษรเดียวกันกดปุ่มเดิมทุกครั้ง — ไม่ตรง layout จริงแต่ดูเป็นธรรมชาติกว่าสุ่ม */
function keyFor(g: string) {
  if (!g.trim()) return SPACE;
  return LETTERS[g.codePointAt(0)! % LETTERS.length];
}

/* ---------- ข้อความบนจอ (วาดลง canvas 2D แล้วใช้เป็น texture) ---------- */
const TEX_W = 1024;
const TEX_H = 768;
const PAD_X = 72;
const MAX_W = TEX_W - PAD_X * 2;
const KICKER = { size: 36, gap: 44 };
const NAME = { size: 96, line: 108, max: 2 };
const DESC = { size: 54, line: 74, max: 3 };
const NAME_GAP = 30;
const SCREEN_BG = '#140E05';

type Fonts = { kicker: string; name: string; desc: string };
type Layout = { kicker: string; name: string[][]; desc: string[][] };

/* next/font ตั้งชื่อฟอนต์ใหม่ให้ — อ่านจากตัวแปร CSS ที่มันสร้าง canvas จึงใช้ฟอนต์เดียวกับหน้าเว็บ */
function readFonts(): Fonts {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => {
    const value = css.getPropertyValue(name).trim();
    return value ? `${value}, ${fallback}` : fallback;
  };
  const body = v('--font-body', 'sans-serif');
  return {
    /* ฟอนต์ mono มีแค่ละติน ตัวไทยใน kicker จึงตกไปใช้ฟอนต์ body */
    kicker: `500 ${KICKER.size}px ${v('--font-mono', body)}`,
    name: `700 ${NAME.size}px ${v('--font-display', 'sans-serif')}`,
    desc: `400 ${DESC.size}px ${body}`,
  };
}

/* ภาษาไทยมีสระบน-ล่างที่ต้องพิมพ์ไปพร้อมพยัญชนะ จึงตัดเป็น grapheme ไม่ใช่ทีละ code unit */
function graphemes(text: string) {
  if (typeof Intl.Segmenter !== 'function') return Array.from(text);
  return Array.from(new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(text), (s) => s.segment);
}

/* ภาษาไทยไม่เว้นวรรคระหว่างคำ — ใช้ Intl.Segmenter ตัดคำเพื่อขึ้นบรรทัดใหม่ */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxLines: number) {
  const words =
    typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter('th', { granularity: 'word' }).segment(text), (s) => s.segment)
      : text.split(/(\s+)/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (!line || ctx.measureText(line + word).width <= MAX_W) {
      line += word;
      continue;
    }
    lines.push(line.trimEnd());
    line = word.trimStart();
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last && ctx.measureText(`${last}…`).width > MAX_W) last = graphemes(last).slice(0, -1).join('');
  kept[maxLines - 1] = `${last.trimEnd()}…`;
  return kept;
}

function layout(ctx: CanvasRenderingContext2D, fonts: Fonts, kicker: string, name: string, desc: string): Layout {
  ctx.font = fonts.name;
  const nameLines = wrap(ctx, name, NAME.max);
  ctx.font = fonts.desc;
  const descLines = wrap(ctx, desc, DESC.max);
  return { kicker, name: nameLines.map(graphemes), desc: descLines.map(graphemes) };
}

/** พิมพ์ทีละบรรทัดจนครบจำนวนตัวอักษรที่ได้รับ แล้วคืนตำแหน่งเคอร์เซอร์ */
function typeLines(ctx: CanvasRenderingContext2D, lines: string[][], y0: number, lineH: number, budget: number) {
  let caretX = PAD_X;
  let caretY = y0;
  for (let i = 0; i < lines.length; i++) {
    const take = Math.min(budget, lines[i].length);
    if (take <= 0 && i > 0) break;
    const text = lines[i].slice(0, take).join('');
    const y = y0 + i * lineH;
    ctx.fillText(text, PAD_X, y);
    caretX = PAD_X + ctx.measureText(text).width;
    caretY = y;
    budget -= take;
    if (take < lines[i].length) break;
  }
  return { caretX, caretY };
}

function draw(
  ctx: CanvasRenderingContext2D,
  fonts: Fonts,
  lay: Layout,
  shown: number,
  entered: boolean,
  cursorOn: boolean
) {
  const nameCount = lay.name.reduce((n, l) => n + l.length, 0);

  ctx.shadowBlur = 0;
  ctx.fillStyle = SCREEN_BG;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  const glow = ctx.createRadialGradient(TEX_W / 2, TEX_H / 2, 0, TEX_W / 2, TEX_H / 2, TEX_W * 0.6);
  glow.addColorStop(0, 'rgba(255,170,40,.11)');
  glow.addColorStop(1, 'rgba(255,170,40,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  /* จัดกลางแนวตั้งจากข้อความเต็ม ตำแหน่งจึงไม่ขยับระหว่างพิมพ์ */
  const blockH =
    KICKER.size + KICKER.gap + lay.name.length * NAME.line + NAME_GAP + lay.desc.length * DESC.line;
  let y = (TEX_H - blockH) / 2 + KICKER.size;

  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(255,160,30,.85)';
  ctx.shadowBlur = 18;

  ctx.font = fonts.kicker;
  ctx.fillStyle = 'rgba(255,185,56,.72)';
  ctx.fillText(`> ${lay.kicker}`, PAD_X, y);
  y += KICKER.gap + NAME.size * 0.9;

  ctx.font = fonts.name;
  ctx.fillStyle = '#FFD27E';
  let caret = { ...typeLines(ctx, lay.name, y, NAME.line, Math.min(shown, nameCount)), size: NAME.size };
  y += (lay.name.length - 1) * NAME.line + NAME_GAP + DESC.size * 1.15;

  if (entered) {
    ctx.font = fonts.desc;
    ctx.fillStyle = 'rgba(255,196,96,.9)';
    caret = { ...typeLines(ctx, lay.desc, y, DESC.line, shown - nameCount), size: DESC.size };
  }

  if (cursorOn) {
    ctx.fillStyle = AMBER;
    ctx.fillRect(caret.caretX + 6, caret.caretY - caret.size * 0.78, caret.size * 0.46, caret.size * 0.86);
  }

  /* เส้น scanline + ขอบมืด + แสงสะท้อนกระจก ให้ดูเป็นจอแก้ว */
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,.24)';
  for (let sy = 0; sy < TEX_H; sy += 4) ctx.fillRect(0, sy, TEX_W, 1.6);
  const vignette = ctx.createRadialGradient(TEX_W / 2, TEX_H / 2, TEX_W * 0.32, TEX_W / 2, TEX_H / 2, TEX_W * 0.74);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,.62)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  const glare = ctx.createLinearGradient(0, 0, TEX_W * 0.6, TEX_H * 0.6);
  glare.addColorStop(0, 'rgba(255,248,230,.11)');
  glare.addColorStop(1, 'rgba(255,248,230,0)');
  ctx.fillStyle = glare;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
}

/* ---------- ลำดับการพิมพ์ของผลงานหนึ่งชิ้น: พิมพ์ชื่อ → Enter → พิมพ์คำอธิบาย → ค้างไว้ → ลบ ---------- */
type Step = { at: number; kind: 'type' | 'enter' | 'back'; key: number };
type Plan = { steps: Step[]; holdAt: number; end: number };

function plan(name: string[], desc: string[]): Plan {
  const steps: Step[] = [];
  const jitter = () => Math.random() * JITTER;
  let t = START_DELAY;
  for (const g of name) steps.push({ at: (t += NAME_CHAR + jitter()), kind: 'type', key: keyFor(g) });
  steps.push({ at: (t += ENTER_PAUSE), kind: 'enter', key: ENTER });
  for (const g of desc) steps.push({ at: (t += DESC_CHAR + jitter()), kind: 'type', key: keyFor(g) });
  const holdAt = (t += HOLD);
  /* +1 คือการลบบรรทัดใหม่ระหว่างชื่อกับคำอธิบาย */
  for (let i = 0; i <= name.length + desc.length; i++) {
    steps.push({ at: (t += ERASE_CHAR), kind: 'back', key: BACKSPACE });
  }
  return { steps, holdAt, end: t + 0.35 };
}

/* r3f รีเซ็ต clock.elapsedTime เป็น 0 ทุกครั้งที่สลับ frameloop (ตอนเลื่อนพ้นจอแล้วกลับมา)
   เวลาที่ปุ่มถูกกดจึงต้องอ้างนาฬิกาที่ไม่ถูกรีเซ็ต ไม่งั้นปุ่มจะค้างหรือกดเองทีหลัง */
const seconds = () => performance.now() / 1000;

function curvedPlane(w: number, h: number, bulge: number) {
  const g = new THREE.PlaneGeometry(w, h, 32, 24);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const nx = p.getX(i) / (w / 2);
    const ny = p.getY(i) / (h / 2);
    p.setZ(i, bulge * (1 - nx * nx) * (1 - ny * ny));
  }
  g.computeVertexNormals();
  return g;
}

type ScreenProps = {
  kicker: string;
  name: string;
  desc: string;
  paused: boolean;
  reduce: boolean;
  onDone: () => void;
  pressed: Float64Array;
};

function Screen({ kicker, name, desc, paused, reduce, onDone, pressed }: ScreenProps) {
  const invalidate = useThree((s) => s.invalidate);
  const material = useRef<THREE.MeshBasicMaterial>(null!);
  const [fonts, setFonts] = useState<Fonts | null>(null);

  const { ctx, texture, geometry } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_W;
    canvas.height = TEX_H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = SCREEN_BG;
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return { ctx, texture, geometry: curvedPlane(1.84, 1.38, 0.05) };
  }, []);

  useEffect(
    () => () => {
      texture.dispose();
      geometry.dispose();
    },
    [texture, geometry]
  );

  /* ต้องรอฟอนต์โหลดเสร็จก่อน ไม่งั้นวัดความกว้างตัดบรรทัดผิด */
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && setFonts(readFonts()));
    return () => {
      alive = false;
    };
  }, []);

  const lay = useMemo(() => (fonts ? layout(ctx, fonts, kicker, name, desc) : null), [ctx, fonts, kicker, name, desc]);

  const pausedRef = useRef(paused);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    pausedRef.current = paused;
    onDoneRef.current = onDone;
  }, [paused, onDone]);

  const run = useRef({
    plan: null as Plan | null,
    nameCount: 0,
    elapsed: 0,
    step: 0,
    shown: 0,
    entered: false,
    done: false,
    lastKey: -10,
    sig: '',
  });

  /* เปลี่ยนผลงาน → เริ่มพิมพ์ใหม่ */
  useEffect(() => {
    if (!lay || !fonts) return;
    const nameFlat = lay.name.flat();
    const descFlat = lay.desc.flat();
    Object.assign(run.current, {
      plan: plan(nameFlat, descFlat),
      nameCount: nameFlat.length,
      elapsed: 0,
      step: 0,
      shown: 0,
      entered: false,
      done: false,
      sig: '',
    });
    if (reduce) {
      draw(ctx, fonts, lay, nameFlat.length + descFlat.length, true, true);
      texture.needsUpdate = true;
      invalidate();
    }
  }, [ctx, fonts, lay, reduce, texture, invalidate]);

  useFrame((_, delta) => {
    const r = run.current;
    if (reduce || !fonts || !lay || !r.plan) return;
    const now = seconds();

    /* จำกัด delta — กลับมาจากแท็บอื่นแล้วจะไม่พิมพ์รวดเดียวทั้งก้อน
       ถ้าเอาเมาส์ชี้อยู่ ค้างข้อความไว้ไม่ลบ */
    let next = r.elapsed + Math.min(delta, 0.1);
    if (pausedRef.current && r.elapsed <= r.plan.holdAt) next = Math.min(next, r.plan.holdAt);
    r.elapsed = next;

    const steps = r.plan.steps;
    while (r.step < steps.length && steps[r.step].at <= r.elapsed) {
      const s = steps[r.step++];
      if (s.kind === 'type') r.shown++;
      else if (s.kind === 'enter') r.entered = true;
      else if (r.entered && r.shown === r.nameCount) r.entered = false;
      else r.shown = Math.max(0, r.shown - 1);
      pressed[s.key] = now;
      r.lastKey = now;
    }
    if (!r.done && r.elapsed >= r.plan.end) {
      r.done = true;
      onDoneRef.current();
    }

    /* เคอร์เซอร์ค้างไว้ระหว่างพิมพ์ กะพริบเมื่อหยุด — วาดใหม่เฉพาะตอนมีอะไรเปลี่ยน */
    const cursorOn = now - r.lastKey < 0.45 || Math.floor(now * 1.9) % 2 === 0;
    const sig = `${r.shown}|${r.entered}|${cursorOn}`;
    if (sig !== r.sig) {
      r.sig = sig;
      draw(ctx, fonts, lay, r.shown, r.entered, cursorOn);
      texture.needsUpdate = true;
    }

    material.current.color.setScalar(0.97 + Math.sin(now * 53) * 0.015 + Math.sin(now * 7.3) * 0.015);
  });

  return (
    <mesh geometry={geometry} position={[0, 0.1, 0.165]}>
      <meshBasicMaterial ref={material} map={texture} toneMapped={false} />
    </mesh>
  );
}

function Monitor(props: Omit<ScreenProps, 'pressed'> & { pressed: Float64Array }) {
  const { bezel, back } = useMemo(() => {
    /* ท้ายจอแก้วเป็นทรงพีระมิดตัด — ใช้ทรงกระบอก 4 เหลี่ยมหมุนให้ด้านตรงกับแกน */
    const back = new THREE.CylinderGeometry(1.42, 0.78, 1.25, 4, 1);
    back.rotateY(Math.PI / 4);
    back.rotateX(Math.PI / 2);
    back.scale(1, 0.86, 1);
    return { bezel: new RoundedBoxGeometry(2.5, 2.05, 0.32, 4, 0.08), back };
  }, []);

  return (
    <group position={[0, 1.645, -0.2]}>
      <mesh geometry={bezel}>
        <meshStandardMaterial color={BEIGE} roughness={0.62} />
      </mesh>
      <mesh geometry={back} position={[0, 0.02, -0.785]}>
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.7} flatShading />
      </mesh>

      {/* ขอบลึกรอบจอ */}
      <mesh position={[0, 0.1, 0.161]}>
        <planeGeometry args={[1.98, 1.52]} />
        <meshStandardMaterial color="#2A251C" roughness={0.9} />
      </mesh>
      <Screen {...props} />

      {/* ป้ายชื่อทอง ปุ่มเปิด และไฟสถานะที่คางจอ */}
      <mesh position={[-0.82, -0.8, 0.165]}>
        <boxGeometry args={[0.46, 0.08, 0.012]} />
        <meshStandardMaterial color="#F0B429" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0.92, -0.8, 0.165]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 20]} />
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.5} />
      </mesh>
      <mesh position={[0.76, -0.8, 0.168]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color="#5BE38F" toneMapped={false} />
      </mesh>

      {/* ฐานหมุนจอ */}
      <mesh position={[0, -1.085, 0]}>
        <boxGeometry args={[1.1, 0.12, 0.9]} />
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.7} />
      </mesh>
    </group>
  );
}

/** เครื่องแบบ desktop แบน ๆ ที่วางจอไว้ข้างบน */
function Case() {
  const body = useMemo(() => new RoundedBoxGeometry(2.9, 0.5, 2.3, 4, 0.05), []);
  return (
    <group position={[0, 0.25, -0.35]}>
      <mesh geometry={body}>
        <meshStandardMaterial color={BEIGE} roughness={0.65} />
      </mesh>
      {[0.1, -0.08].map((y) => (
        <group key={y} position={[0.6, y, 1.152]}>
          <mesh>
            <boxGeometry args={[0.95, 0.15, 0.01]} />
            <meshStandardMaterial color={BEIGE_DARK} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.01, 0.006]}>
            <boxGeometry args={[0.66, 0.035, 0.01]} />
            <meshStandardMaterial color="#1D1913" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.95 + i * 0.09, 0, 1.152]}>
          <boxGeometry args={[0.035, 0.22, 0.01]} />
          <meshStandardMaterial color="#B9AB8B" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[-1.25, 0.12, 1.156]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color="#5BE38F" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Keyboard({ pressed }: { pressed: Float64Array }) {
  const caps = useRef<(THREE.Mesh | null)[]>([]);
  const { base, shapes, alpha, mod } = useMemo(() => {
    const shapes = new Map<number, THREE.BufferGeometry>();
    for (const k of KEYS) {
      if (!shapes.has(k.w)) shapes.set(k.w, new RoundedBoxGeometry(k.w * U - 0.024, KEY_H, U - 0.024, 2, 0.012));
    }
    return {
      base: new RoundedBoxGeometry(2.7, 0.1, 1.0, 3, 0.03),
      shapes,
      alpha: new THREE.MeshStandardMaterial({ color: KEYCAP, roughness: 0.55 }),
      mod: new THREE.MeshStandardMaterial({ color: BEIGE_DARK, roughness: 0.6 }),
    };
  }, []);

  /* ปุ่มยุบลงทันทีที่ถูกกด แล้วค่อย ๆ เด้งกลับ */
  useFrame(() => {
    const now = seconds();
    for (let i = 0; i < KEYS.length; i++) {
      const cap = caps.current[i];
      if (!cap) continue;
      const d = now - pressed[i];
      const depth = d < 0.06 ? 1 : d < 0.18 ? 1 - (d - 0.06) / 0.12 : 0;
      cap.position.y = KEY_REST - depth * 0.032;
    }
  });

  return (
    <group position={[0, 0, 1.55]} rotation={[0.07, 0, 0]}>
      <mesh geometry={base} position={[0, 0.05, 0]}>
        <meshStandardMaterial color={BEIGE} roughness={0.65} />
      </mesh>
      {KEYS.map((k, i) => (
        <mesh
          key={i}
          ref={(m) => {
            caps.current[i] = m;
          }}
          geometry={shapes.get(k.w)}
          material={k.mod ? mod : alpha}
          position={[k.x, KEY_REST, k.z]}
        />
      ))}
    </group>
  );
}

/** เงานุ่ม ๆ ใต้ตัวเครื่อง — วาด gradient แทนการเปิด shadow map ทั้งฉาก */
function SoftShadow() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, 'rgba(20,17,12,.42)');
    grad.addColorStop(1, 'rgba(20,17,12,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.2]}>
      <planeGeometry args={[6, 5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

function Scene(props: Omit<ScreenProps, 'pressed'>) {
  const rig = useRef<THREE.Group>(null!);
  const pressed = useMemo(() => new Float64Array(KEYS.length).fill(-10), []);

  /* โยกช้า ๆ และหันตามเมาส์เล็กน้อย */
  useFrame((state) => {
    if (props.reduce) return;
    const t = seconds();
    const ry = Math.sin(t * 0.35) * 0.06 + state.pointer.x * 0.16;
    const rx = -state.pointer.y * 0.04;
    rig.current.rotation.y += (ry - rig.current.rotation.y) * 0.04;
    rig.current.rotation.x += (rx - rig.current.rotation.x) * 0.04;
  });

  return (
    <>
      <hemisphereLight args={['#FFF6E5', '#B8A888', 1.5]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      {/* แสงอำพันจากจอตกกระทบคีย์บอร์ด */}
      <pointLight position={[0, 1.6, 1.1]} color={AMBER} intensity={2.5} distance={3.5} decay={2} />
      <group ref={rig}>
        <SoftShadow />
        <Case />
        <Monitor {...props} pressed={pressed} />
        <Keyboard pressed={pressed} />
      </group>
    </>
  );
}

/* เปลี่ยน frameloop จาก never กลับเป็น always แล้ว r3f ไม่เริ่ม loop เอง (loop หยุดไปแล้ว)
   ต้องสะกิดด้วย invalidate ไม่งั้นจอค้างว่างจนกว่าจะมีอะไรมากระตุ้น */
function Wake({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);
  return null;
}

export type RetroComputerProps = Omit<ScreenProps, 'pressed'>;

/** คอมพิวเตอร์จอแก้วยุค 90 ที่พิมพ์ชื่อผลงานขึ้นจอ ปุ่มบนคีย์บอร์ดยุบตามตัวอักษรที่พิมพ์ */
export function RetroComputer(props: RetroComputerProps) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  /* เลื่อนพ้นจอแล้วหยุดเรนเดอร์ ประหยัดแบตมือถือ */
  useEffect(() => {
    const el = box.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="machine-canvas">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 3.1, 7.2], fov: 29 }}
        onCreated={({ camera }) => camera.lookAt(0, 1.0, 0.45)}
        frameloop={props.reduce ? 'demand' : visible ? 'always' : 'never'}
        fallback={null}
      >
        <Wake active={visible && !props.reduce} />
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
