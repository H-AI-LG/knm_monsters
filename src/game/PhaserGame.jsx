import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import MainScene from "./MainScene";
import { joy, hooks } from "./input";

export default function PhaserGame({ onNearArtifact, onActivateArtifact }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const thumbRef = useRef(null);
  const nearbyRef = useRef(null);
  const [nearby, setNearby] = useState(null);
  const [location, setLocation] = useState("중앙홀 1층");

  useEffect(() => {
    if (gameRef.current) return;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: "#2c2a3a",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 430,
        height: 760,
      },
      physics: { default: "arcade", arcade: { gravity: { y: 0 } } },
      scene: MainScene,
    });
    if (import.meta.env.DEV) window.__JEONSAENGDO_GAME__ = gameRef.current;

    hooks.onArtifact = (artifactId) => {
      setNearby(artifactId);
      nearbyRef.current = artifactId;
      onNearArtifact?.(artifactId);
    };
    hooks.onActivate = () => {
      if (nearbyRef.current) onActivateArtifact?.(nearbyRef.current);
    };
    hooks.onMapChange = (name) => setLocation(name);

    return () => {
      hooks.onArtifact = null;
      hooks.onActivate = null;
      hooks.onMapChange = null;
      if (import.meta.env.DEV) delete window.__JEONSAENGDO_GAME__;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onNearArtifact, onActivateArtifact]);

  // 가상 조이스틱
  const maxR = 34;
  const center = useRef({ x: 0, y: 0 });

  const startJoy = (clientX, clientY, baseEl) => {
    const rect = baseEl.getBoundingClientRect();
    center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    joy.active = true;
    moveJoy(clientX, clientY);
  };
  const moveJoy = (clientX, clientY) => {
    let dx = clientX - center.current.x;
    let dy = clientY - center.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    if (thumbRef.current) thumbRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    joy.x = dx / maxR;
    joy.y = dy / maxR;
  };
  const endJoy = () => {
    joy.active = false;
    joy.x = 0;
    joy.y = 0;
    if (thumbRef.current) thumbRef.current.style.transform = "translate(0px, 0px)";
  };

  const handleActivateButton = () => {
    if (nearbyRef.current) onActivateArtifact?.(nearbyRef.current);
  };

  return (
    <>
      <div className="game-container" ref={containerRef} />

      <div className="location-badge">{location}</div>

      {/* 유물 감지 알림 (하단) */}
      {nearby && (
        <div className="artifact-notice">
          <span className="artifact-notice-icon">🏺</span>
          <span className="artifact-notice-text">유물이 감지되었습니다!</span>
          <span className="artifact-notice-key">A</span>
          <span className="artifact-notice-hint">상호작용</span>
        </div>
      )}

      {/* 가상 조이스틱 */}
      <div
        className="joy-base"
        onTouchStart={(e) => startJoy(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget)}
        onTouchMove={(e) => moveJoy(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={endJoy}
        onMouseDown={(e) => startJoy(e.clientX, e.clientY, e.currentTarget)}
        onMouseMove={(e) => joy.active && moveJoy(e.clientX, e.clientY)}
        onMouseUp={endJoy}
        onMouseLeave={() => joy.active && endJoy()}
      >
        <div className="joy-thumb" ref={thumbRef} />
      </div>

      {/* 모바일 A버튼 — 유물 근처일 때만 표시 */}
      {nearby && (
        <button
          className="action-btn"
          onTouchStart={(e) => { e.preventDefault(); handleActivateButton(); }}
          onMouseDown={handleActivateButton}
        >
          A
        </button>
      )}
    </>
  );
}
