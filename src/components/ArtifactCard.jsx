/**
 * ArtifactCard — 포켓몬 카드 스타일 유물 정령 카드
 * Props: artifact, playerName, praise, cardRef (html2canvas 캡처용)
 */

const GRADE_COLOR  = { 일반: "#7ab87a", 고급: "#5b9bd5", 전설: "#c9a24b", 보스: "#c04040" };
const GRADE_DOTS   = { 일반: "◆◆",    고급: "◆◆◆",   전설: "◆◆◆◆", 보스: "◆◆◆◆◆" };
const GRADE_RULE   = {
  일반:  "유물 정령이 감동받으면 마음의 봉인이 열린다.",
  고급:  "고급 정령의 가호가 수호자의 발걸음을 이끈다.",
  전설:  "전설 정령이 각성하면 역사 그 자체가 숨을 쉰다.",
  보스:  "수호신에게 인정받은 자만이 이 힘을 담을 수 있다.",
};

// 시대별 아트 영역 그라디언트
const ERA_ART_BG = {
  구석기:  "radial-gradient(ellipse at 50% 35%, #c87820 0%, #7a4010 45%, #2e1204 100%)",
  신석기:  "radial-gradient(ellipse at 50% 35%, #5a9030 0%, #2a5010 45%, #0c1e04 100%)",
  청동기:  "radial-gradient(ellipse at 50% 35%, #80a838 0%, #3c7814 45%, #122808 100%)",
  백제:    "radial-gradient(ellipse at 50% 35%, #d8b040 0%, #906020 45%, #381804 100%)",
  가야:    "radial-gradient(ellipse at 50% 35%, #7870d0 0%, #38308a 45%, #0e0828 100%)",
  신라:    "radial-gradient(ellipse at 50% 35%, #e0a000 0%, #906800 45%, #341c00 100%)",
  통일신라:"radial-gradient(ellipse at 50% 35%, #9060d0 0%, #4c1890 45%, #140830 100%)",
  고려:    "radial-gradient(ellipse at 50% 35%, #30b8a8 0%, #0e7060 45%, #022018 100%)",
  조선:    "radial-gradient(ellipse at 50% 35%, #c8a850 0%, #785e1a 45%, #2c1c04 100%)",
  대한제국:"radial-gradient(ellipse at 50% 35%, #d07828 0%, #8a4010 45%, #2a1004 100%)",
  삼국:    "radial-gradient(ellipse at 50% 35%, #d09820 0%, #845200 45%, #281400 100%)",
  그리스:  "radial-gradient(ellipse at 50% 35%, #6898e0 0%, #304890 45%, #0e1838 100%)",
  간다라:  "radial-gradient(ellipse at 50% 35%, #c89858 0%, #805830 45%, #281808 100%)",
  당나라:  "radial-gradient(ellipse at 50% 35%, #d05858 0%, #802020 45%, #200808 100%)",
  일본:    "radial-gradient(ellipse at 50% 35%, #d06888 0%, #801840 45%, #200818 100%)",
};

function getArtBg(era = "") {
  const key = Object.keys(ERA_ART_BG).find(k => era.includes(k));
  return ERA_ART_BG[key]
    ?? "radial-gradient(ellipse at 50% 35%, #b89040 0%, #604a10 45%, #1a1004 100%)";
}

export default function ArtifactCard({ artifact, playerName, praise, cardRef }) {
  const accent = GRADE_COLOR[artifact.grade] ?? "#c9a24b";
  const artBg  = getArtBg(artifact.era);

  return (
    <div
      className="ac-card"
      ref={cardRef}
      style={{ "--accent": accent, "--art-bg": artBg }}
    >
      {/* 홀로그램 시머 */}
      <div className="ac-shimmer" />

      {/* ── 헤더 ── */}
      <div className="ac-header">
        <div className="ac-header-left">
          <span className="ac-era-tag">{artifact.era || "한국사"}</span>
          <span className="ac-card-name">{artifact.name}</span>
        </div>
        <div className="ac-grade-pill" style={{ background: accent }}>
          {artifact.grade}
        </div>
      </div>

      {/* ── 아트 프레임 ── */}
      <div className="ac-art-wrap">
        <div className="ac-art-frame">
          {/* 배경 그라디언트 */}
          <div className="ac-art-bg" style={{ background: artBg }} />
          {/* 빛 줄기 */}
          <div className="ac-art-beam"
            style={{ background: `radial-gradient(ellipse at 50% 80%, ${accent}50 0%, transparent 65%)` }}
          />
          {/* 유물 스프라이트 — 프레임 위로 살짝 넘침 */}
          <img className="ac-sprite" src={artifact.image} alt={artifact.name}
            style={{ filter: `drop-shadow(0 0 14px ${accent}cc)` }}
          />
          {/* 코너 장식 */}
          <span className="ac-corner ac-tl" style={{ borderColor: accent }} />
          <span className="ac-corner ac-tr" style={{ borderColor: accent }} />
          <span className="ac-corner ac-bl" style={{ borderColor: accent }} />
          <span className="ac-corner ac-br" style={{ borderColor: accent }} />
        </div>
      </div>

      {/* ── 정보 바디 ── */}
      <div className="ac-body">
        <div className="ac-persona-row">
          <span style={{ color: accent }}>✦ {artifact.persona}</span>
          <span className="ac-era-sub"> · {artifact.era}</span>
        </div>

        <div className="ac-divider"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}99, transparent)` }}
        />

        {/* 칭찬 텍스트 */}
        <div className="ac-praise-box">
          <span className="ac-quote-mark" style={{ color: accent }}>"</span>
          <p className="ac-praise-text">{praise}</p>
          <span className="ac-quote-mark ac-quote-end" style={{ color: accent }}>"</span>
        </div>
      </div>

      {/* ── 푸터 ── */}
      <div className="ac-footer" style={{ borderColor: accent }}>
        <div className="ac-footer-left">
          <span className="ac-dots" style={{ color: accent }}>{GRADE_DOTS[artifact.grade] ?? "◆◆"}</span>
          <span className="ac-guardian-name">수호자 · {playerName || "탐험가"}</span>
        </div>
        <div className="ac-rule-box" style={{ background: accent }}>
          <span className="ac-rule-label">정령 카드</span>
        </div>
      </div>
      <div className="ac-rule-text">{GRADE_RULE[artifact.grade]}</div>
    </div>
  );
}
