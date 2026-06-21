// BGM: HTML Audio (외부 WAV 파일) + 효과음: Web Audio API

// ── BGM ────────────────────────────────────────────────
const BGM_SRC = {
  title:             "/audio/bgm_title.wav",
  intro:             "/audio/bgm_intro.wav",
  explore_bright:    "/audio/bgm_explore_bright.wav",
  explore_calm:      "/audio/bgm_explore_calm.wav",
  spirit_common:     "/audio/bgm_spirit_common.wav",
  spirit_rare:       "/audio/bgm_spirit_rare.wav",
  spirit_legendary:  "/audio/bgm_spirit_legendary.wav",
  quiz:              "/audio/bgm_quiz.wav",
  quiz_rare:         "/audio/quiz_rare.wav",
  quiz_legendary:    "/audio/quiz_legendary.wav",
  boss:              "/audio/bgm_boss.wav",
  praise:            "/audio/bgm_praise.wav",
  ending:            "/audio/bgm_ending.wav",
};

// 탐험 BGM은 루프 대신 교대 재생
const EXPLORE_TRACKS = ["explore_bright", "explore_calm"];

let bgmAudio = null;
let currentTrack = null;
let pendingTrack = null;

function onFirstInteraction() {
  document.removeEventListener("click", onFirstInteraction);
  document.removeEventListener("touchstart", onFirstInteraction);
  if (pendingTrack) {
    const t = pendingTrack;
    pendingTrack = null;
    playBGM(t);
  }
}

export function playBGM(track) {
  if (currentTrack === track && bgmAudio && !bgmAudio.paused) return;
  stopBGM();
  const src = BGM_SRC[track];
  if (!src) return;
  bgmAudio = new Audio(src);
  const isExplore = EXPLORE_TRACKS.includes(track);
  bgmAudio.loop = !isExplore;
  bgmAudio.volume = 0.5;
  if (isExplore) {
    // 트랙이 끝나면 반대 탐험 BGM으로 교체
    bgmAudio.onended = () => {
      const next = EXPLORE_TRACKS.find(t => t !== track) ?? "explore_calm";
      playBGM(next);
    };
  }
  bgmAudio.play().catch(() => {
    // 브라우저 autoplay 차단 시 첫 클릭 후 재시도
    pendingTrack = track;
    document.addEventListener("click", onFirstInteraction, { once: true });
    document.addEventListener("touchstart", onFirstInteraction, { once: true });
  });
  currentTrack = track;
}

// 탐험 BGM 랜덤 시작 (이미 재생 중이면 유지)
export function playExploreBGM() {
  if (EXPLORE_TRACKS.includes(currentTrack) && bgmAudio && !bgmAudio.paused) return;
  const pick = EXPLORE_TRACKS[Math.floor(Math.random() * EXPLORE_TRACKS.length)];
  playBGM(pick);
}

export function stopBGM() {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    bgmAudio = null;
    currentTrack = null;
  }
}

export function setBGMVolume(v) {
  if (bgmAudio) bgmAudio.volume = Math.max(0, Math.min(1, v));
}

// ── Web Audio 컨텍스트 (효과음용) ────────────────────────
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

