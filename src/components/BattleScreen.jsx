import { useState, useEffect, useRef, useMemo } from "react";

// ── 유물별 이펙트 타입 정의 ──────────────────────────────────────
const EFFECT_TYPES = {
  EARTH:   { particles: ["#9B7350","#C4935A","#6B4820"], count: 10, idle: "idle-shake" },
  GOLD:    { particles: ["#FFD700","#FFA500","#FFE566"], count: 12, idle: "idle-float" },
  SACRED:  { particles: ["#FFD060","#FFFACC","#FFB830"], count: 14, idle: "idle-glow"  },
  STEEL:   { particles: ["#9AAAC0","#C0CADC","#6878A0"], count: 8,  idle: "idle-shake" },
  JADE:    { particles: ["#4DB880","#70D898","#309060"], count: 10, idle: "idle-sway"  },
  BRONZE:  { particles: ["#A07040","#60A858","#C09050"], count: 10, idle: "idle-float" },
  INK:     { particles: ["#4868C8","#2448A8","#6888D8"], count: 8,  idle: "idle-sway"  },
  CRIMSON: { particles: ["#D04848","#FF6868","#A02828"], count: 12, idle: "idle-pulse" },
  PEARL:   { particles: ["#C8D8E8","#A8C0D8","#E8F0F8"], count: 12, idle: "idle-float" },
  LOTUS:   { particles: ["#FF80B8","#FFB0D0","#FF50A0"], count: 14, idle: "idle-float" },
  DARK:    { particles: ["#7830D0","#A84890","#5010B0"], count: 16, idle: "idle-pulse" },
  SMOKE:   { particles: ["#90A8B8","#607888","#B0C8D0"], count: 10, idle: "idle-sway"  },
  SILVER:  { particles: ["#C0C8D8","#8898B8","#E0E8F0"], count: 10, idle: "idle-float" },
};

// 유물 ID → 이펙트 타입
const ARTIFACT_EFFECT = {
  artifact_001: "EARTH",   // 주먹도끼 — 흙먼지, 원시 진동
  artifact_002: "EARTH",   // 빗살무늬토기 — 흙연기, 안정적 흔들림
  artifact_003: "BRONZE",  // 농경문청동기 — 청동 산화빛 + 녹색
  artifact_004: "STEEL",   // 동검 — 금속 스파크
  artifact_005: "EARTH",   // 호우총그릇 — 오래된 흙 기운
  artifact_006: "GOLD",    // 무령왕비금제관식 — 황금 반짝
  artifact_007: "STEEL",   // 가야갑옷 — 철 스파크
  artifact_008: "GOLD",    // 금관 — 황금 빛 폭발
  artifact_009: "DARK",    // 경천사탑(보스) — 어두운 기운 + 균열
  artifact_010: "SACRED",  // 철불 — 불교 금빛 후광
  artifact_011: "INK",     // 경전 — 먹빛 파티클
  artifact_012: "INK",     // 한글금속활자 — 잉크 방울
  artifact_013: "INK",     // 대동여지도 — 먹빛 지도
  artifact_014: "GOLD",    // 외규장각의궤 — 황금 의장
  artifact_015: "CRIMSON", // 칙명지보 — 붉은 인장
  artifact_016: "EARTH",   // 낭공대사비 — 돌가루
  artifact_017: "JADE",    // 노송도 — 소나무 초록
  artifact_018: "SACRED",  // 변상도 — 불교 금빛
  artifact_019: "PEARL",   // 나전칠상자 — 자개 무지개빛
  artifact_020: "STEEL",   // 그리스투구 — 지중해 금속
  artifact_021: "SACRED",  // 감산사석불 — 석불 후광
  artifact_022: "GOLD",    // 반가사유상 — 전설 황금 오라
  artifact_023: "SILVER",  // 은입사정병 — 은빛 물결
  artifact_024: "SMOKE",   // 청자향로 — 향 연기
  artifact_025: "JADE",    // 자라병 — 청자 물빛
  artifact_026: "PEARL",   // 달항아리 — 백자 은은한 빛
  artifact_027: "CRIMSON", // 복희여와 — 신화 붉은 기운
  artifact_028: "SACRED",  // 간다라보살 — 간다라 황금
  artifact_029: "INK",     // 청화백자 — 청화 파랑
  artifact_030: "LOTUS",   // 겐지모노가타리 — 벚꽃
};

function ArtifactParticles({ effectType }) {
  const cfg = EFFECT_TYPES[effectType] ?? EFFECT_TYPES.GOLD;
  const count = cfg.count;

  const items = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      color: cfg.particles[i % cfg.particles.length],
      x: 8 + ((i * 73 + 17) % 84),
      size: 4 + ((i * 37 + 5) % 7),
      delay: ((i * 43) % 26) / 10,
      dur: 2.4 + ((i * 29) % 18) / 10,
      drift: -24 + ((i * 53) % 48),
    })),
  [effectType, count]);

  return (
    <div className="bs-particles">
      {items.map((p) => (
        <div
          key={p.id}
          className="bs-particle"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            "--drift": `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

const STEP = {
  GREETING: "greeting",
  DIALOGUE_1: "dialogue1",
  DIALOGUE_2: "dialogue2",
  QUIZ: "quiz",
  RESULT: "result",
  ACQUIRED: "acquired",
};

const ERA_THEMES = {
  구석기: { bg: "linear-gradient(180deg,#2a1a08 0%,#4a3018 50%,#6b4a28 100%)", accent: "#c8a030" },
  신석기: { bg: "linear-gradient(180deg,#142010 0%,#243820 50%,#3a5830 100%)", accent: "#7ab870" },
  청동기: { bg: "linear-gradient(180deg,#0e1a0a 0%,#1c3415 50%,#2a5020 100%)", accent: "#6aaa5a" },
  백제:   { bg: "linear-gradient(180deg,#1e160a 0%,#3a2c10 50%,#604a18 100%)", accent: "#e0c060" },
  가야:   { bg: "linear-gradient(180deg,#0e0e1e 0%,#181830 50%,#242448 100%)", accent: "#8888c8" },
  신라:   { bg: "linear-gradient(180deg,#1e1000 0%,#3c2200 50%,#785000 100%)", accent: "#ffc800" },
  통일신라:{ bg: "linear-gradient(180deg,#10081c 0%,#1e1038 50%,#301858 100%)", accent: "#b888e0" },
  고려:   { bg: "linear-gradient(180deg,#041212 0%,#082424 50%,#0c3c38 100%)", accent: "#60b0a8" },
  조선:   { bg: "linear-gradient(180deg,#181208 0%,#302414 50%,#503c18 100%)", accent: "#c8a860" },
  대한제국:{ bg: "linear-gradient(180deg,#1c0808 0%,#381010 50%,#701818 100%)", accent: "#e08820" },
  삼국:   { bg: "linear-gradient(180deg,#181000 0%,#341e00 50%,#5c3c00 100%)", accent: "#e8c040" },
  그리스: { bg: "linear-gradient(180deg,#08101e 0%,#101c32 50%,#1c2e4a 100%)", accent: "#80a8e0" },
  간다라: { bg: "linear-gradient(180deg,#181008 0%,#302010 50%,#583820 100%)", accent: "#d8a860" },
  당나라: { bg: "linear-gradient(180deg,#1c0808 0%,#381010 50%,#681818 100%)", accent: "#e06060" },
  일본:   { bg: "linear-gradient(180deg,#1e0810 0%,#3c1020 50%,#781838 100%)", accent: "#e06880" },
};

function getTheme(era = "") {
  const key = Object.keys(ERA_THEMES).find((k) => era.includes(k));
  return ERA_THEMES[key] ?? { bg: "linear-gradient(180deg,#181520 0%,#2c2a3a 50%,#3a3550 100%)", accent: "#c9a24b" };
}

function useTyping(text, speed = 28, active = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!active || !text) { setDisplayed(text || ""); setDone(true); return; }
    setDisplayed(""); setDone(false);
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(timer.current); setDone(true); }
    }, speed);
    return () => clearInterval(timer.current);
  }, [text, active, speed]);

  const skip = () => {
    if (done) return;
    clearInterval(timer.current);
    setDisplayed(text);
    setDone(true);
  };

  return { displayed, done, skip };
}

// SVG 균열 오버레이
function RiftOverlay({ accent }) {
  return (
    <div className="rift-overlay" style={{ "--accent": accent }}>
      <div className="rift-flash" />
      <svg className="rift-svg" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="crack-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* 메인 균열 — 위에서 아래 대각선 */}
        <polyline
          points="185,0 180,160 172,320 160,480 155,640"
          fill="none" stroke={accent} strokeWidth="2.5"
          filter="url(#crack-glow)" className="crack-main"
        />
        {/* 가지 균열 1 */}
        <polyline
          points="172,320 220,420 260,500"
          fill="none" stroke={accent} strokeWidth="1.5"
          filter="url(#crack-glow)" className="crack-branch1"
        />
        {/* 가지 균열 2 */}
        <polyline
          points="180,160 130,240 100,310"
          fill="none" stroke={accent} strokeWidth="1.5"
          filter="url(#crack-glow)" className="crack-branch2"
        />
        {/* 작은 균열 */}
        <polyline
          points="172,320 145,360 135,390"
          fill="none" stroke={accent} strokeWidth="1"
          filter="url(#crack-glow)" className="crack-branch3"
        />
      </svg>
      <div className="rift-center-glow" style={{ background: `radial-gradient(circle, ${accent}88 0%, transparent 65%)` }} />
    </div>
  );
}

const GRADE_COLOR = { 일반: "#7ab87a", 고급: "#5b9bd5", 전설: "#c9a24b", 보스: "#c04040" };

export default function BattleScreen({ artifact, onClose, collected, onCollect }) {
  const [phase, setPhase] = useState("rift"); // rift | battle | exiting
  const [spriteIn, setSpriteIn] = useState(false);
  const [spriteIdle, setSpriteIdle] = useState(false);
  const effectType = ARTIFACT_EFFECT[artifact.id] ?? "GOLD";
  const effectCfg = EFFECT_TYPES[effectType];
  const [step, setStep] = useState(STEP.GREETING);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizCorrect, setQuizCorrect] = useState(null);

  const theme = getTheme(artifact.era);
  const isCollected = collected.has(artifact.id);

  // 균열 → 전투 화면 전환 타이밍
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("battle"), 1050);
    const t2 = setTimeout(() => setSpriteIn(true), 1350);
    const t3 = setTimeout(() => setSpriteIdle(true), 2150);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleClose = () => {
    setPhase("exiting");
    setTimeout(onClose, 450);
  };

  // 현재 단계의 타이핑 텍스트
  const typingText =
    step === STEP.GREETING   ? artifact.greeting
    : step === STEP.DIALOGUE_1 ? artifact.dialogues[0].question
    : step === STEP.DIALOGUE_2 ? artifact.dialogues[1].question
    : null;

  const { displayed, done, skip } = useTyping(typingText, 28, phase === "battle");

  const isDialogueStep = [STEP.GREETING, STEP.DIALOGUE_1, STEP.DIALOGUE_2].includes(step);

  const handleDialogueArea = () => {
    if (!done) { skip(); return; }
    if (step === STEP.GREETING) {
      setStep(STEP.DIALOGUE_1);
      setSelectedChoice(null);
    }
  };

  const handleChoiceNext = () => {
    if (step === STEP.DIALOGUE_1) { setStep(STEP.DIALOGUE_2); setSelectedChoice(null); }
    else if (step === STEP.DIALOGUE_2) { setStep(STEP.QUIZ); }
  };

  const handleQuizSubmit = () => {
    if (quizSelected === null) return;
    setQuizCorrect(quizSelected === artifact.quiz.answer);
    setStep(STEP.RESULT);
  };

  const handleResult = () => {
    if (quizCorrect) {
      onCollect(artifact.id);
      setStep(STEP.ACQUIRED);
    } else {
      setStep(STEP.QUIZ);
      setQuizSelected(null);
      setQuizCorrect(null);
    }
  };

  return (
    <div className={`bs-root bs-${phase}`} style={{ "--accent": theme.accent }}>

      {/* ── 균열 전환 오버레이 ── */}
      {phase === "rift" && <RiftOverlay accent={theme.accent} />}

      {/* ── 전투 화면 ── */}
      <div className="bs-screen" style={{ background: theme.bg }}>

        {/* 상단 — 유물 이미지 영역 */}
        <div className="bs-top">
          <div className="bs-bg-grid" />

          <div className="bs-badges">
            <span className="bs-grade" style={{ background: GRADE_COLOR[artifact.grade] ?? "#888" }}>
              {artifact.grade}
            </span>
            <span className="bs-num">No.{artifact.number}</span>
            {isCollected && <span className="bs-owned">✓ 수집됨</span>}
          </div>

          {/* 빛기둥 */}
          <div className="bs-light-pillar" style={{ background: `linear-gradient(to top, ${theme.accent}30 0%, ${theme.accent}08 60%, transparent 100%)` }} />
          <div className="bs-light-halo"   style={{ background: `radial-gradient(ellipse at center, ${theme.accent}28 0%, transparent 68%)` }} />

          {/* 유물별 파티클 이펙트 */}
          {phase === "battle" && <ArtifactParticles effectType={effectType} />}

          {/* 코너 장식 */}
          <div className="bs-corners" style={{ "--accent": theme.accent }}>
            <span className="bs-corner tl" /><span className="bs-corner tr" />
            <span className="bs-corner bl" /><span className="bs-corner br" />
          </div>

          <img
            className={`bs-sprite ${spriteIn ? "bs-sprite-in" : ""} ${spriteIdle ? effectCfg.idle : ""}`}
            src={artifact.image}
            alt={artifact.name}
          />

          <div className={`bs-nameplate ${spriteIn ? "nameplate-in" : ""}`}>
            <span className="bs-aname">{artifact.name}</span>
            <span className="bs-aera">{artifact.era}</span>
          </div>
        </div>

        {/* 하단 — 대화 / 퀴즈 영역 */}
        <div className="bs-bottom">

          {/* 닫기 버튼 */}
          {step !== STEP.ACQUIRED && (
            <button className="bs-close" onClick={handleClose}>✕</button>
          )}

          {/* ── 인사 / 대화 단계 ── */}
          {isDialogueStep && (
            <div
              className="bs-dialogue"
              onClick={step === STEP.GREETING ? handleDialogueArea : undefined}
            >
              <div className="bs-persona" style={{ color: theme.accent }}>
                {artifact.persona}
              </div>
              <p className="bs-text">
                {displayed}
                {!done && <span className="bs-cursor">|</span>}
              </p>

              {/* 인사 단계 완료 → 계속 힌트 */}
              {done && step === STEP.GREETING && (
                <span className="bs-continue" style={{ color: theme.accent }}>
                  화면 터치 / A키로 계속 ▼
                </span>
              )}

              {/* 대화 선택지 */}
              {done && (step === STEP.DIALOGUE_1 || step === STEP.DIALOGUE_2) && (() => {
                const dlg = artifact.dialogues[step === STEP.DIALOGUE_1 ? 0 : 1];
                return (
                  <div className="bs-choices" onClick={(e) => e.stopPropagation()}>
                    {dlg.choices.map((c, i) => (
                      <button
                        key={i}
                        className={`bs-choice ${selectedChoice === i ? "bs-choice-sel" : ""}`}
                        style={selectedChoice === i ? { borderColor: theme.accent, color: theme.accent } : {}}
                        onClick={() => setSelectedChoice(i)}
                      >
                        ▶ {c.text}
                      </button>
                    ))}

                    {selectedChoice !== null && (
                      <div className="bs-answer">
                        {dlg.choices[selectedChoice].answer}
                      </div>
                    )}

                    {selectedChoice !== null && (
                      <button
                        className="bs-next"
                        style={{ background: theme.accent }}
                        onClick={handleChoiceNext}
                      >
                        {step === STEP.DIALOGUE_2 ? "퀴즈 풀기 →" : "다음 →"}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── 퀴즈 단계 ── */}
          {step === STEP.QUIZ && (
            <div className="bs-quiz">
              <div className="bs-qlabel" style={{ color: theme.accent }}>⚡ 퀴즈</div>
              <p className="bs-qtext">{artifact.quiz.question}</p>
              <div className="bs-qopts">
                {artifact.quiz.options.map((opt, i) => (
                  <button
                    key={i}
                    className={`bs-qopt ${quizSelected === i ? "bs-qopt-sel" : ""}`}
                    style={quizSelected === i ? { borderColor: theme.accent, background: theme.accent + "22" } : {}}
                    onClick={() => setQuizSelected(i)}
                  >
                    {String.fromCharCode(9312 + i)} {opt}
                  </button>
                ))}
              </div>
              <button
                className="bs-next"
                style={{ background: quizSelected !== null ? theme.accent : "#444", cursor: quizSelected !== null ? "pointer" : "not-allowed" }}
                onClick={handleQuizSubmit}
                disabled={quizSelected === null}
              >
                정답 제출
              </button>
            </div>
          )}

          {/* ── 결과 단계 ── */}
          {step === STEP.RESULT && (
            <div className="bs-result">
              <div className="bs-result-emoji">{quizCorrect ? "🎉" : "💦"}</div>
              <div className={`bs-result-msg ${quizCorrect ? "bs-correct" : "bs-wrong"}`}>
                {quizCorrect ? "정답!" : "틀렸어요!"}
              </div>
              <div className="bs-result-sub">
                {quizCorrect
                  ? artifact.quiz.options[artifact.quiz.answer]
                  : "다시 도전해볼까요?"}
              </div>
              <button
                className="bs-next"
                style={{ background: theme.accent }}
                onClick={handleResult}
              >
                {quizCorrect ? "수호신 획득! →" : "다시 풀기 →"}
              </button>
            </div>
          )}

          {/* ── 획득 단계 ── */}
          {step === STEP.ACQUIRED && (
            <div className="bs-acquired">
              <div className="bs-acq-sparkle">✨</div>
              <div className="bs-acq-title" style={{ color: theme.accent }}>수호신 획득!</div>
              <div className="bs-acq-name">{artifact.name}</div>
              <div className="bs-acq-sub">도감에 등록되었습니다</div>
              <div className="bs-acq-count">{collected.size + 1} / 30 수집</div>
              <button
                className="bs-next"
                style={{ background: theme.accent }}
                onClick={handleClose}
              >
                계속 탐험하기
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
