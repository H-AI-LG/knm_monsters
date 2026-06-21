import { useState, useEffect } from "react";

export default function DevPanel({ onExit }) {
  const [json, setJson] = useState(() => localStorage.getItem("knm_dev_coords") || "");
  const [copied, setCopied] = useState(false);

  // Phaser에서 확정 저장 시 자동 갱신
  useEffect(() => {
    window.__onDevSave = (newJson) => setJson(newJson);
    return () => { window.__onDevSave = null; };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRefresh = () => {
    setJson(localStorage.getItem("knm_dev_coords") || "");
  };

  return (
    <div style={{
      position: "fixed", top: 10, right: 10, width: 340,
      background: "rgba(0,10,0,0.92)", color: "#00ff66",
      border: "1px solid #004400", borderRadius: 8,
      padding: 12, zIndex: 9999, fontFamily: "monospace", fontSize: 12,
      boxShadow: "0 4px 24px #000a",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <b style={{ fontSize: 13 }}>🛠️ DEV 에디터 패널</b>
        <button
          onClick={onExit}
          style={{ background: "#330000", color: "#ff4444", border: "1px solid #660000",
            borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 12 }}
        >
          종료
        </button>
      </div>

      <p style={{ color: "#aaa", fontSize: 10, margin: "0 0 8px" }}>
        게임 화면에서 파랑(포탈) · 금색(유물) 박스 드래그 →<br />
        우측상단 [확정 저장] 클릭 → 여기서 복사해서 채민에게 전달
      </p>

      <textarea
        readOnly
        value={json}
        placeholder="아직 저장된 좌표 없음 — 게임에서 확정 저장을 눌러주세요"
        style={{
          width: "100%", height: 220, background: "#001100", color: "#00ff66",
          border: "1px solid #004400", borderRadius: 4, fontSize: 10,
          padding: 6, resize: "none", boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button
          onClick={handleRefresh}
          style={{ flex: 1, background: "#003300", color: "#00ff66", border: "1px solid #006600",
            borderRadius: 4, padding: "5px 0", cursor: "pointer", fontSize: 12 }}
        >
          새로고침
        </button>
        <button
          onClick={handleCopy}
          style={{ flex: 2, background: copied ? "#005500" : "#004400", color: "#fff",
            border: "1px solid #00aa00", borderRadius: 4, padding: "5px 0",
            cursor: "pointer", fontSize: 12, fontWeight: "bold" }}
        >
          {copied ? "✔ 복사됨!" : "클립보드 복사"}
        </button>
      </div>
    </div>
  );
}
