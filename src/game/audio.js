// Web Audio API 기반 효과음 + 앰비언트 BGM (외부 파일 불필요)

let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function resume() {
  const c = getCtx();
  if (c.state === "suspended") c.resume();
  return c;
}

// ── 효과음 ────────────────────────────────────────────

export function playRift() {
  const c = resume();
  const t = c.currentTime;
  // 저음 드럼 + 고음 쉭 소리
  const osc = c.createOscillator();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  osc.connect(filter); filter.connect(gain); gain.connect(c.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.9);
  filter.type = "bandpass"; filter.frequency.value = 300; filter.Q.value = 2;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.35, t + 0.08);
  gain.gain.linearRampToValueAtTime(0, t + 0.95);
  osc.start(t); osc.stop(t + 1.0);

  // 높은 파열음
  const osc2 = c.createOscillator();
  const gain2 = c.createGain();
  osc2.connect(gain2); gain2.connect(c.destination);
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(800, t + 0.05);
  osc2.frequency.exponentialRampToValueAtTime(200, t + 0.5);
  gain2.gain.setValueAtTime(0, t + 0.05);
  gain2.gain.linearRampToValueAtTime(0.15, t + 0.1);
  gain2.gain.linearRampToValueAtTime(0, t + 0.5);
  osc2.start(t + 0.05); osc2.stop(t + 0.6);
}

export function playCorrect() {
  const c = resume();
  const t = c.currentTime;
  // 밝은 상승 3화음 아르페지오
  [523, 659, 784].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = "sine"; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.28, t + i * 0.1 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.35);
    osc.start(t + i * 0.1); osc.stop(t + i * 0.1 + 0.4);
  });
}

export function playWrong() {
  const c = resume();
  const t = c.currentTime;
  // 불협화음 하강
  [220, 196].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = "sawtooth"; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.22, t + i * 0.12 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.28);
    osc.start(t + i * 0.12); osc.stop(t + i * 0.12 + 0.32);
  });
}

export function playAcquired() {
  const c = resume();
  const t = c.currentTime;
  // 화려한 상승 아르페지오 + 반짝임
  [523, 659, 784, 1047, 1319].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = i < 3 ? "sine" : "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t + i * 0.07);
    gain.gain.linearRampToValueAtTime(0.3 - i * 0.04, t + i * 0.07 + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.5);
    osc.start(t + i * 0.07); osc.stop(t + i * 0.07 + 0.55);
  });
}

export function playDialogue() {
  const c = resume();
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain); gain.connect(c.destination);
  osc.type = "sine"; osc.frequency.value = 660;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.06, t + 0.02);
  gain.gain.linearRampToValueAtTime(0, t + 0.08);
  osc.start(t); osc.stop(t + 0.1);
}

// ── 앰비언트 BGM ────────────────────────────────────────
let bgmNodes = null;
let bgmGain = null;

export function startBGM() {
  if (bgmNodes) return;
  const c = resume();
  bgmNodes = [];

  const master = c.createGain();
  master.gain.value = 0;
  master.connect(c.destination);
  bgmGain = master;

  // Am 화음 드론 (110, 165, 247, 330 Hz)
  const harmonics = [
    { freq: 110, type: "sine",     vol: 0.5 },
    { freq: 165, type: "triangle", vol: 0.3 },
    { freq: 220, type: "sine",     vol: 0.2 },
    { freq: 247, type: "triangle", vol: 0.15 },
    { freq: 330, type: "sine",     vol: 0.1 },
  ];

  harmonics.forEach(({ freq, type, vol }) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    const filter = c.createBiquadFilter();
    osc.connect(filter); filter.connect(g); g.connect(master);
    osc.type = type; osc.frequency.value = freq;
    filter.type = "lowpass"; filter.frequency.value = 1200;
    g.gain.value = vol;
    osc.start();
    bgmNodes.push(osc);
  });

  // 느린 LFO로 볼륨 호흡감
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.08; lfoGain.gain.value = 0.015;
  lfo.connect(lfoGain); lfoGain.connect(master.gain);
  lfo.start();
  bgmNodes.push(lfo);

  // 페이드인
  master.gain.linearRampToValueAtTime(0.18, c.currentTime + 3);
}

export function stopBGM() {
  if (!bgmNodes || !bgmGain) return;
  const c = getCtx();
  bgmGain.gain.linearRampToValueAtTime(0, c.currentTime + 1.5);
  setTimeout(() => {
    bgmNodes.forEach(n => { try { n.stop(); } catch {} });
    bgmNodes = null; bgmGain = null;
  }, 1600);
}

export function setBGMVolume(v) {
  if (bgmGain) bgmGain.gain.value = v;
}
