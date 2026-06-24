import { useState, useRef, useEffect } from "react";
import { ARTIFACTS } from "../data/artifacts";

const GRADE_COLOR = { 일반: "#7ab87a", 고급: "#5b9bd5", 전설: "#c9a24b", 보스: "#c04040" };
const ALL = Object.values(ARTIFACTS).sort((a, b) => a.number.localeCompare(b.number));

function DoGamChat({ artifact, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const accent = GRADE_COLOR[artifact.grade] ?? "#c9a24b";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifact_id: artifact.id,
          artifact_name: artifact.name,
          message: msg,
          stage: "free",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || `채팅 서버 오류 (${res.status})`);
      }
      setMessages(prev => [...prev, { role: "ai", text: data.reply || "답변이 비어 있어요. 백엔드 응답 형식을 확인해주세요." }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "ai",
        text: `앗, 연결이 안 됐어요. ${error.message || "잠깐 후에 다시 해봐요!"}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dg-chat-overlay" onClick={onClose}>
      <div className="dg-chat-card" onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="dg-chat-header">
          <img className="dg-chat-avatar" src={artifact.image} alt={artifact.name} />
          <div className="dg-chat-info">
            <span className="dg-chat-name" style={{ color: accent }}>{artifact.name}</span>
            <span className="dg-chat-persona">{artifact.persona}</span>
          </div>
          <button className="dg-chat-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 메시지 */}
        <div className="dg-chat-messages">
          {messages.length === 0 && (
            <div className="dg-chat-empty">
              {artifact.persona}에게 무엇이든 물어보세요! 👂
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`dg-chat-msg dg-chat-msg-${m.role}`}>
              {m.role === "ai" && (
                <span className="dg-chat-msg-label" style={{ color: accent }}>
                  {artifact.persona}
                </span>
              )}
              <span className="dg-chat-msg-text" style={
                m.role === "user"
                  ? { background: accent, filter: "brightness(0.82)" }
                  : {}
              }>
                {m.text}
              </span>
            </div>
          ))}
          {loading && (
            <div className="dg-chat-msg dg-chat-msg-ai">
              <span className="dg-chat-msg-label" style={{ color: accent }}>{artifact.persona}</span>
              <span className="dg-chat-msg-text dg-chat-typing">
                <span /><span /><span />
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* 입력 */}
        <div className="dg-chat-input-row">
          <input
            className="dg-chat-input"
            style={{ "--accent": accent }}
            type="text"
            placeholder="궁금한 것을 입력하세요..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            disabled={loading}
            autoFocus
          />
          <button
            className="dg-chat-send"
            style={{ background: accent }}
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            전송
          </button>
        </div>

      </div>
    </div>
  );
}

export default function DoGam({ collected, targetArtifactIds, onClose }) {
  const [selected, setSelected] = useState(null);
  const [chatTarget, setChatTarget] = useState(null);
  const [activeHint, setActiveHint] = useState(null); // 위치 힌트 표시용

  // 타겟 유물 Set (없으면 빈 Set — 게스트 모드)
  const targetSet = new Set(targetArtifactIds ?? []);
  const hasTarget = targetSet.size > 0;

  // 미션 진행 카운트: 타겟 중 수집된 것
  const missionDone = hasTarget
    ? [...targetSet].filter((id) => collected.has(id)).length
    : 0;

  return (
    <div className="dg-root">
      {/* 헤더 */}
      <div className="dg-header">
        <button className="dg-close" onClick={onClose}>✕</button>
        <span className="dg-title">수호신 도감</span>
        <span className="dg-count">
          {hasTarget ? (
            <>
              <span className="dg-count-label">내 미션 </span>
              <span className="dg-count-num">{missionDone}</span>
              <span className="dg-count-sep"> / {targetSet.size}</span>
            </>
          ) : (
            <>
              <span className="dg-count-num">{collected.size}</span>
              <span className="dg-count-sep"> / {ALL.length}</span>
            </>
          )}
        </span>
      </div>

      {/* 그리드 */}
      <div className="dg-grid">
        {ALL.map((a) => {
          const isCollected = collected.has(a.id);
          const isTarget = targetSet.has(a.id);
          return (
            <div
              key={a.id}
              className={`dg-card ${isCollected ? "dg-card-on" : "dg-card-off"} ${isTarget && !isCollected ? "dg-card-target" : ""}`}
              onClick={() => {
                if (isCollected) {
                  setSelected(selected?.id === a.id ? null : a);
                } else if (a.locationHint) {
                  setActiveHint({
                    name: a.name,
                    location: a.locationHint
                  });
                }
              }}
            >
              <div className="dg-img-wrap">
                <img
                  className={`dg-img ${isCollected ? "" : "dg-img-locked"}`}
                  src={a.image}
                  alt={a.name}
                />
                {!isCollected && <span className="dg-lock">{isTarget ? "!" : "?"}</span>}
                {isTarget && isCollected && <span className="dg-target-done">✓</span>}
              </div>
              <div className="dg-num">No.{a.number}</div>
              <div className="dg-name">{isCollected ? a.name : isTarget ? "???" : "???"}</div>
              {isCollected && (
                <div
                  className="dg-grade"
                  style={{ background: GRADE_COLOR[a.grade] ?? "#888" }}
                >
                  {a.grade}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 상세 패널 */}
      {selected && (
        <div className="dg-detail" onClick={() => setSelected(null)}>
          <div className="dg-detail-card" onClick={(e) => e.stopPropagation()}>
            <div
              className="dg-detail-grade"
              style={{ background: GRADE_COLOR[selected.grade] ?? "#888" }}
            >
              {selected.grade} · No.{selected.number}
            </div>
            <img className="dg-detail-img" src={selected.image} alt={selected.name} />
            <div className="dg-detail-name">{selected.name}</div>
            <div className="dg-detail-era">{selected.era}</div>
            <div className="dg-detail-persona">{selected.persona}</div>
            <p className="dg-detail-greeting">"{selected.greeting}"</p>

            {/* 대화하기 버튼 */}
            <button
              className="dg-detail-chat-btn"
              style={{ "--grade-color": GRADE_COLOR[selected.grade] ?? "#c9a24b" }}
              onClick={() => { setChatTarget(selected); setSelected(null); }}
            >
              💬 대화하기
            </button>

            <button className="dg-detail-close" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
      {/*힌트 알림 오버레이 팝업 추가 */}
      {activeHint && (
        <div className="dg-chat-overlay" onClick={() => setActiveHint(null)}>
          <div className="dg-chat-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "360px", padding: "20px" }}>
            <div className="dg-chat-header" style={{ justifyContent: "center", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              <span className="dg-chat-name" style={{ color: "#333", fontSize: "1.15rem" }}>🔍 유물 위치 탐색 힌트</span>
            </div>
            <div style={{ padding: "20px 10px", textAlign: "center" }}>
              <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "0.95rem" }}>
                아직 발견하지 못한 수호신 <strong>[???]</strong>의 흔적이야!
              </p>
              <div style={{ backgroundColor: "#f4f8ff", border: "1px solid #d0e2ff", padding: "15px", borderRadius: "10px", color: "#222", fontSize: "1rem", lineHeight: "1.5", wordBreak: "keep-all" }}>
                💬 "나는 국립중앙박물관 <span style={{ color: "#0052cc", fontWeight: "bold" }}>{activeHint.location}</span>에 있어. 얼른 나를 구출해 줘!"
              </div>
            </div>
            <button
              className="dg-detail-chat-btn"
              style={{ width: "100%", marginTop: "10px", background: "#0052cc", color: "#fff" }}
              onClick={() => setActiveHint(null)}
            >
              확인완료
            </button>
          </div>
        </div>
      )}

      {/* 채팅 오버레이 */}
      {chatTarget && (
        <DoGamChat
          artifact={chatTarget}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
}
