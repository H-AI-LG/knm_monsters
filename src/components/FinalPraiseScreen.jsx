import { useState, useEffect, useRef } from "react";
import { ARTIFACTS } from "../data/artifacts";
import RelicCard from "./RelicCard";
import { downloadCardPng } from "./captureCard";

const GRADE_KEY = { 일반: "common", 고급: "rare", 전설: "legendary", 보스: "boss" };

function toEraKey(era = "") {
  if (era.includes("구석기")) return "paleo";
  if (era.includes("고구려")) return "goguryeo";
  if (era.includes("발해")) return "balhae";
  if (era.includes("신석기") || era.includes("청동기") || era.includes("초기철기") || era.includes("삼한")) return "bronze";
  if (era.includes("백제") || era.includes("삼국")) return "baekje";
  if (era.includes("통일신라")) return "silla";
  if (era.includes("가야")) return "gaya";
  if (era.includes("신라")) return "silla";
  if (era.includes("고려")) return "goryeo";
  if (era.includes("조선") || era.includes("대한제국")) return "joseon";
  if (era.includes("그리스") || era.includes("간다라")) return "greece";
  if (era.includes("당") || era.includes("중국") || era.includes("송") || era.includes("명")) return "tang";
  if (era.includes("일본")) return "japan";
  return "bronze";
}

const MIN_LENGTH = 5;

// ── 광개토대왕 대사 ──────────────────────────────────────────────
// lineIdx 0~2: 말 탄 이미지 / 3~4: 걸어오는 이미지
const GWANG_HORSE   = "/sprites/gwanggaeto_horse.png";
const GWANG_WALKING = "/sprites/gwanggaeto_walking.png";

const makeIntroLines = (playerName) => [
  "천년동안 잠들었던 나의 마음을 깨우는 수호자가 나타났구나..",
  `${playerName || "수호자"}... 자네는 진정 우리 역사와 유물을 사랑하는 아이구나...`,
  "좋아...! 마지막 관문이다, 어린 수호자.",
  "네가 이 여정에서 가장 마음을 나눈 정령 셋을 기억하느냐?",
  "그 정령들에게 진심 어린 칭찬을 남겨봐.\n네 마음이 담기면... 특별한 선물을 주지.",
];
const INTRO_PAUSES = [2400, 2800, 2000, 2600, 0];

function useTyping(text, speed = 32) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearInterval(timer.current);
    if (!text) { setDisplayed(""); setDone(true); return; }
    setDisplayed(""); setDone(false);
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(timer.current); setDone(true); }
    }, speed);
    return () => clearInterval(timer.current);
  }, [text, speed]);

  const skip = () => { clearInterval(timer.current); setDisplayed(text); setDone(true); };
  return { displayed, done, skip };
}


// ── Intro Phase ───────────────────────────────────────────────────
function IntroPhase({ onDone, playerName }) {
  const [lineIdx, setLineIdx] = useState(0);
  const introLines = makeIntroLines(playerName);
  const { displayed, done, skip } = useTyping(introLines[lineIdx], 30);

  const isHorse = lineIdx <= 2;
  const currentImg = isHorse ? GWANG_HORSE : GWANG_WALKING;

  useEffect(() => {
    if (!done) return;
    if (lineIdx >= introLines.length - 1) return;
    const pause = INTRO_PAUSES[lineIdx] ?? 2000;
    if (pause === 0) return;
    const t = setTimeout(() => setLineIdx(i => i + 1), pause);
    return () => clearTimeout(t);
  }, [done, lineIdx]);

  const handleTap = () => {
    if (!done) { skip(); return; }
    if (lineIdx < introLines.length - 1) setLineIdx(i => i + 1);
  };

  const isLast = lineIdx >= introLines.length - 1;

  return (
    <div className="fps-intro" onClick={handleTap}>
      <div className="fps-intro-bg" />
      <div className="fps-villain-visual">
        <img
          key={currentImg}
          className={`fps-gwang-img ${isHorse ? "fps-gwang-horse" : "fps-gwang-walking"}`}
          src={currentImg}
          alt="광개토대왕"
        />
      </div>
      <div className="fps-intro-box">
        <div className="fps-intro-speaker">⚡ 광개토대왕</div>
        <p className="fps-intro-line">
          {displayed}
          {!done && <span className="fps-cursor">|</span>}
        </p>
        {done && !isLast && <span className="fps-hint">화면을 터치하면 계속됩니다 ▼</span>}
        {done && isLast && (
          <button className="fps-intro-btn" onClick={e => { e.stopPropagation(); onDone(); }}>
            마음을 전하러 가기 →
          </button>
        )}
      </div>
      {!isLast && (
        <button className="fps-skip-btn" onClick={e => { e.stopPropagation(); onDone(); }}>
          건너뛰기
        </button>
      )}
    </div>
  );
}

// ── Praise Input Phase ────────────────────────────────────────────
function PraisePhase({ top3Artifacts, onDone }) {
  const [curIdx, setCurIdx] = useState(0);
  // 3개 칭찬 독립적으로 관리
  const [praises, setPraises] = useState(["", "", ""]);
  const [shake, setShake] = useState(false);
  const textareaRef = useRef(null);

  const current = top3Artifacts[curIdx];
  const allFilled = praises.every(p => p.trim().length >= MIN_LENGTH);

  // 탭 전환 시 포커스
  useEffect(() => { textareaRef.current?.focus(); }, [curIdx]);

  const handleChange = (val) => {
    setPraises(prev => {
      const next = [...prev];
      next[curIdx] = val;
      return next;
    });
  };

  const goTo = (idx) => {
    if (idx < 0 || idx >= top3Artifacts.length) return;
    setCurIdx(idx);
  };

  const handleGift = () => {
    if (!allFilled) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    onDone(praises.map(p => p.trim()));
  };

  if (!current) return null;

  return (
    <div className="fps-praise">
      <div className="fps-praise-bg" />

      {/* ── 상단 탭 (유물 3개) ── */}
      <div className="fps-tabs">
        {top3Artifacts.map((a, i) => {
          const filled = praises[i].trim().length >= MIN_LENGTH;
          return (
            <button
              key={a.id}
              className={`fps-tab ${i === curIdx ? "fps-tab-active" : ""} ${filled ? "fps-tab-done" : ""}`}
              onClick={() => goTo(i)}
            >
              <img className="fps-tab-img" src={a.image} alt={a.name} />
              <span className="fps-tab-num">#{i + 1}</span>
              {filled && <span className="fps-tab-check">✓</span>}
            </button>
          );
        })}
      </div>

      {/* ── 유물 표시 (← → 네비) ── */}
      <div className="fps-artifact-nav">
        <button
          className="fps-nav-arrow"
          onClick={() => goTo(curIdx - 1)}
          disabled={curIdx === 0}
        >‹</button>

        <div className="fps-praise-card">
          <div className="fps-praise-num">#{curIdx + 1}</div>
          <img className="fps-praise-img" src={current.image} alt={current.name} />
          <div className="fps-praise-name">{current.name}</div>
          <div className="fps-praise-persona">{current.persona}</div>
        </div>

        <button
          className="fps-nav-arrow"
          onClick={() => goTo(curIdx + 1)}
          disabled={curIdx === top3Artifacts.length - 1}
        >›</button>
      </div>

      {/* ── 칭찬 입력 ── */}
      <div className="fps-input-label">
        이 정령에게 진심 어린 칭찬을 남겨봐! ✍️
      </div>

      <div className={`fps-input-wrap ${shake ? "fps-shake" : ""}`}>
        <textarea
          ref={textareaRef}
          className="fps-textarea"
          placeholder={`예) ${current.name}는 정말 ${current.era} 시대를 잘 보여줘서 대단해!`}
          value={praises[curIdx]}
          onChange={e => handleChange(e.target.value)}
          rows={3}
          maxLength={120}
        />
        <div className="fps-char-count">
          <span style={{ color: praises[curIdx].trim().length >= MIN_LENGTH ? "#7ab87a" : "inherit" }}>
            {praises[curIdx].length}
          </span> / 120
        </div>
      </div>

      {/* ── 선물 받기 버튼 ── */}
      <div className="fps-gift-hint">
        {!allFilled && (
          <span>
            {praises.filter(p => p.trim().length >= MIN_LENGTH).length} / {top3Artifacts.length} 정령 완료
          </span>
        )}
      </div>
      <button
        className={`fps-gift-btn ${allFilled ? "fps-gift-btn-on" : ""}`}
        onClick={handleGift}
        disabled={!allFilled}
      >
        선물 받기
      </button>
    </div>
  );
}

// ── Scoring Loading Phase ─────────────────────────────────────────
const SCORING_MESSAGES = [
  "정령들이 마음을 읽는 중...",
  "진심의 무게를 재고 있어...",
  "역사의 빛이 깃드는 중...",
  "카드에 마법을 새기는 중...",
];

function ScoringPhase() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % SCORING_MESSAGES.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fps-scoring">
      <div className="fps-scoring-orb" />
      <div className="fps-scoring-text">{SCORING_MESSAGES[msgIdx]}</div>
      <div className="fps-scoring-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

// ── Card Reveal Phase ─────────────────────────────────────────────
const GRADE_LABEL = { common: "일반", rare: "고급", legendary: "전설", boss: "보스" };

function RevealPhase({ top3Artifacts, praises, aiGrades, feedbacks, playerName, onNext }) {
  const [flash, setFlash] = useState(true);
  const [revealed, setRevealed] = useState([]);
  const [zoomedIdx, setZoomedIdx] = useState(null); // null | 0 | 1 | 2
  const cardRefs = useRef([]);

  useEffect(() => {
    const t1 = setTimeout(() => setFlash(false), 700);
    const t2 = setTimeout(() => setRevealed([0]), 900);
    const t3 = setTimeout(() => setRevealed([0, 1]), 1300);
    const t4 = setTimeout(() => setRevealed([0, 1, 2]), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const handleSave = async (idx) => {
    const el = cardRefs.current[idx];
    if (!el) return;
    await downloadCardPng(el, `유물정령카드_${top3Artifacts[idx].name}_${playerName || "탐험가"}.png`);
  };

  const getGrade = (artifact, idx) => {
    if (artifact.grade === "boss") return "boss";
    return aiGrades[idx] ?? GRADE_KEY[artifact.grade] ?? "common";
  };

  return (
    <div className="fps-reveal">
      {flash && <div className="fps-flash" />}

      <div className="fps-reveal-header">
        <div className="fps-reveal-title">✦ 유물 정령 카드 완성! ✦</div>
        <div className="fps-reveal-sub">카드를 눌러 크게 보고, 저장해봐</div>
      </div>

      {/* 카드 가로 스크롤 */}
      <div className="fps-cards-row">
        {top3Artifacts.map((artifact, idx) => {
          const isRevealed = revealed.includes(idx);
          const grade = getGrade(artifact, idx);
          return (
            <div
              key={artifact.id}
              className={`fps-card-slot ${isRevealed ? "fps-card-in" : ""}`}
              style={{ transitionDelay: `${idx * 0.1}s` }}
            >
              {/* AI 등급 뱃지 */}
              {isRevealed && feedbacks[idx] && (
                <div className={`fps-grade-badge fps-grade-badge--${grade}`}>
                  {GRADE_LABEL[grade]} 등급 달성!
                </div>
              )}
              {/* 카드 클릭 → 확대 */}
              <div
                className="fps-card-clickable"
                onClick={() => isRevealed && setZoomedIdx(idx)}
                title="클릭해서 크게 보기"
              >
                <RelicCard
                  ref={el => (cardRefs.current[idx] = el)}
                  artifactName={artifact.name}
                  spiritName={artifact.persona}
                  era={artifact.era}
                  eraKey={toEraKey(artifact.era)}
                  grade={grade}
                  spriteUrl={artifact.image}
                  praiseText={praises[idx] ?? ""}
                  playerName={playerName}
                  artifactNumber={artifact.number}
                />
                {isRevealed && <div className="fps-card-tap-hint">탭해서 크게 보기 🔍</div>}
              </div>
              {/* AI 피드백 */}
              {isRevealed && feedbacks[idx] && (
                <div className="fps-card-feedback">✦ {feedbacks[idx]}</div>
              )}
            </div>
          );
        })}
      </div>

      {revealed.length >= top3Artifacts.length && (
        <button className="fps-next-btn" onClick={onNext}>
          다음으로 →
        </button>
      )}

      {/* ── 카드 확대 모달 ── */}
      {zoomedIdx !== null && (
        <div className="fps-zoom-overlay" onClick={() => setZoomedIdx(null)}>
          <div className="fps-zoom-inner" onClick={e => e.stopPropagation()}>
            <div className="fps-zoom-card-wrap">
              <RelicCard
                artifactName={top3Artifacts[zoomedIdx].name}
                spiritName={top3Artifacts[zoomedIdx].persona}
                era={top3Artifacts[zoomedIdx].era}
                eraKey={toEraKey(top3Artifacts[zoomedIdx].era)}
                grade={getGrade(top3Artifacts[zoomedIdx], zoomedIdx)}
                spriteUrl={top3Artifacts[zoomedIdx].image}
                praiseText={praises[zoomedIdx] ?? ""}
                playerName={playerName}
                artifactNumber={top3Artifacts[zoomedIdx].number}
              />
            </div>
            <div className="fps-zoom-btns">
              <button
                className="fps-save-btn"
                onClick={() => handleSave(zoomedIdx)}
              >
                💾 저장하기
              </button>
              <button
                className="fps-zoom-close"
                onClick={() => setZoomedIdx(null)}
              >
                ✕ 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function scorePraises(top3Artifacts, praises) {
  try {
    const body = {
      praises: top3Artifacts.map((artifact, idx) => ({
        artifact_id: artifact.id,
        artifact_name: artifact.name,
        era: artifact.era ?? "",
        praise_text: praises[idx] ?? "",
      })),
    };
    const res = await fetch(`${API_BASE}/api/chat/praise/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("score API failed");
    const data = await res.json();
    return data.results; // [{ artifact_id, grade, score, feedback }]
  } catch {
    return null; // 백엔드 실패 → 폴백
  }
}

export default function FinalPraiseScreen({ top3, playerName, onComplete }) {
  const [phase, setPhase] = useState("intro");
  const [praises, setPraises] = useState([]);
  const [aiGrades, setAiGrades] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const top3Artifacts = (top3 || []).map(id => ARTIFACTS[id]).filter(Boolean);

  if (top3Artifacts.length === 0) {
    onComplete();
    return null;
  }

  const handlePraiseDone = async (completedPraises) => {
    setPraises(completedPraises);
    setPhase("scoring");

    const results = await scorePraises(top3Artifacts, completedPraises);

    if (results) {
      setAiGrades(results.map(r => r.grade));
      setFeedbacks(results.map(r => r.feedback));
    } else {
      // 폴백: 유물 자체 등급 사용
      setAiGrades(top3Artifacts.map(a => GRADE_KEY[a.grade] ?? "common"));
      setFeedbacks([]);
    }

    setPhase("reveal");
  };

  return (
    <div className="fps-root">
      {phase === "intro" && <IntroPhase onDone={() => setPhase("praise")} playerName={playerName} />}
      {phase === "praise" && (
        <PraisePhase
          top3Artifacts={top3Artifacts}
          onDone={handlePraiseDone}
        />
      )}
      {phase === "scoring" && <ScoringPhase />}
      {phase === "reveal" && (
        <RevealPhase
          top3Artifacts={top3Artifacts}
          praises={praises}
          aiGrades={aiGrades}
          feedbacks={feedbacks}
          playerName={playerName}
          onNext={onComplete}
        />
      )}
    </div>
  );
}
