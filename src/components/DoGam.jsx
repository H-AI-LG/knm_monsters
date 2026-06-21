import { useState } from "react";
import { ARTIFACTS } from "../data/artifacts";

const GRADE_COLOR = { 일반: "#7ab87a", 고급: "#5b9bd5", 전설: "#c9a24b", 보스: "#c04040" };
const ALL = Object.values(ARTIFACTS).sort((a, b) => a.number.localeCompare(b.number));

export default function DoGam({ collected, onClose }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="dg-root">
      {/* 헤더 */}
      <div className="dg-header">
        <button className="dg-close" onClick={onClose}>✕</button>
        <span className="dg-title">수호신 도감</span>
        <span className="dg-count">
          <span className="dg-count-num">{collected.size}</span>
          <span className="dg-count-sep"> / {ALL.length}</span>
        </span>
      </div>

      {/* 그리드 */}
      <div className="dg-grid">
        {ALL.map((a) => {
          const isCollected = collected.has(a.id);
          return (
            <div
              key={a.id}
              className={`dg-card ${isCollected ? "dg-card-on" : "dg-card-off"}`}
              onClick={() => isCollected && setSelected(selected?.id === a.id ? null : a)}
            >
              <div className="dg-img-wrap">
                <img
                  className={`dg-img ${isCollected ? "" : "dg-img-locked"}`}
                  src={a.image}
                  alt={a.name}
                />
                {!isCollected && <span className="dg-lock">?</span>}
              </div>
              <div className="dg-num">No.{a.number}</div>
              <div className="dg-name">{isCollected ? a.name : "???"}</div>
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
            <button className="dg-detail-close" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
