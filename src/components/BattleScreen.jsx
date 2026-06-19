import { useState, useEffect, useRef } from "react";

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
    return () => { clearTimeout(t1); clearTimeout(t2); };
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

          {/* 코너 장식 */}
          <div className="bs-corners" style={{ "--accent": theme.accent }}>
            <span className="bs-corner tl" /><span className="bs-corner tr" />
            <span className="bs-corner bl" /><span className="bs-corner br" />
          </div>

          <img
            className={`bs-sprite ${spriteIn ? "bs-sprite-in" : ""}`}
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
