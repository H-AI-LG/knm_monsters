import { useState, useEffect } from "react";

const MAP_LIST = [
  { key: "lobby",       name: "중앙홀 1층" },
  { key: "lobby2F",     name: "중앙홀 2층" },
  { key: "medieval",    name: "조선·대한제국관" },
  { key: "goryeo",      name: "고려관" },
  { key: "sillaBalhae", name: "통일신라·발해관" },
  { key: "prehistory",  name: "선사관" },
  { key: "ancient",     name: "삼한·고대관" },
];

const btn = (style, onClick, children) => (
  <button onClick={onClick} style={{
    background: "#002200", color: "#00ff66",
    border: "1px solid #004400", borderRadius: 4,
    padding: "5px 0", cursor: "pointer", fontSize: 12,
    width: "100%", textAlign: "left", paddingLeft: 8,
    ...style,
  }}>
    {children}
  </button>
);

export default function DevPanel({ onExit }) {
  const [status, setStatus]       = useState("대기 중");
  const [mapKey, setMapKey]       = useState(() => localStorage.getItem("knm_devLastMap") || "");
  const [mapOpen, setMapOpen]     = useState(false);

  useEffect(() => {
    window.__onDevSave = (json) => {
      try {
        const parsed = JSON.parse(json);
        setMapKey(parsed.mapKey || "");
        setStatus("✔ 저장 완료");
        setTimeout(() => setStatus("대기 중"), 3000);
      } catch {
        setStatus("저장됨");
      }
    };
    return () => { window.__onDevSave = null; };
  }, []);

  const teleport = (key) => {
    localStorage.setItem("knm_devLastMap", key);
    window.__teleportToMap?.(key);
    setMapOpen(false);
    setMapKey(key);
  };

  return (
    <div style={{
      position: "fixed", top: 10, right: 10, width: 200,
      background: "rgba(0,10,0,0.93)", color: "#00ff66",
      border: "1px solid #004400", borderRadius: 8,
      padding: "10px 12px", zIndex: 9999,
      fontFamily: "monospace", fontSize: 12,
      boxShadow: "0 4px 24px #000a",
    }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <b>🛠️ DEV</b>
        <button onClick={onExit} style={{
          background: "#330000", color: "#ff5555",
          border: "1px solid #660000", borderRadius: 4,
          padding: "2px 8px", cursor: "pointer", fontSize: 11,
        }}>종료</button>
      </div>

      {/* 현재 맵 */}
      {mapKey && (
        <div style={{ color: "#ffff44", fontSize: 10, marginBottom: 8 }}>
          [{mapKey}]
        </div>
      )}

      {/* 맵 이동 */}
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => setMapOpen(v => !v)}
          style={{
            width: "100%", background: "#001a33", color: "#66aaff",
            border: "1px solid #003366", borderRadius: 4,
            padding: "6px 8px", cursor: "pointer", fontSize: 12,
            textAlign: "left", display: "flex", justifyContent: "space-between",
          }}
        >
          <span>🗺️ 맵 이동</span>
          <span>{mapOpen ? "▲" : "▼"}</span>
        </button>

        {mapOpen && (
          <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            {MAP_LIST.map(m => (
              <button
                key={m.key}
                onClick={() => teleport(m.key)}
                style={{
                  background: "#001122", color: "#aaddff",
                  border: "1px solid #003355", borderRadius: 4,
                  padding: "5px 8px", cursor: "pointer", fontSize: 11,
                  textAlign: "left",
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 안내 */}
      <div style={{ color: "#666", fontSize: 10, lineHeight: 1.5, marginBottom: 8, borderTop: "1px solid #003300", paddingTop: 8 }}>
        파랑=포탈 &nbsp; 금색=유물<br />
        박스 드래그 → 이동<br />
        우하단 □ 드래그 → 크기 조정<br />
        우상단 [확정 저장] → 적용
      </div>

      {/* 저장 상태 */}
      <div style={{
        color: status.startsWith("✔") ? "#00ff66" : "#555",
        fontSize: 11, fontWeight: "bold",
      }}>
        {status}
      </div>
    </div>
  );
}
