import { useState, useEffect } from "react";

export default function DevPanel({ onExit }) {
  const [status, setStatus] = useState("대기 중");
  const [mapKey, setMapKey] = useState("");

  useEffect(() => {
    window.__onDevSave = (json) => {
      try {
        const parsed = JSON.parse(json);
        setMapKey(parsed.mapKey || "");
        setStatus("✔ dev_coords.json 저장 완료");
        setTimeout(() => setStatus("대기 중"), 3000);
      } catch {
        setStatus("저장됨");
      }
    };
    return () => { window.__onDevSave = null; };
  }, []);

  return (
    <div style={{
      position: "fixed", top: 10, right: 10, width: 220,
      background: "rgba(0,10,0,0.92)", color: "#00ff66",
      border: "1px solid #004400", borderRadius: 8,
      padding: "10px 14px", zIndex: 9999,
      fontFamily: "monospace", fontSize: 12,
      boxShadow: "0 4px 24px #000a",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <b>🛠️ DEV 에디터</b>
        <button onClick={onExit} style={{
          background: "#330000", color: "#ff4444",
          border: "1px solid #660000", borderRadius: 4,
          padding: "2px 8px", cursor: "pointer", fontSize: 11,
        }}>
          종료
        </button>
      </div>

      {mapKey && <div style={{ color: "#ffff44", marginBottom: 4, fontSize: 11 }}>[{mapKey}]</div>}

      <div style={{ color: "#aaa", fontSize: 10, lineHeight: 1.5, marginBottom: 8 }}>
        파랑 = 포탈 &nbsp; 금색 = 유물<br />
        드래그 후 우상단 [확정 저장]<br />
        → <b style={{ color: "#00ff66" }}>dev_coords.json</b> 자동 저장
      </div>

      <div style={{
        color: status.startsWith("✔") ? "#00ff66" : "#888",
        fontSize: 11, fontWeight: "bold",
      }}>
        {status}
      </div>
    </div>
  );
}
