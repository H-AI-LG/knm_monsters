import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import MainScene from "./MainScene";
import { joy, hooks } from "./input";

export default function PhaserGame({ onArtifactReached }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const thumbRef = useRef(null);
  const [nearby, setNearby] = useState(null); // 현재 근처 유물 이름
  const [location, setLocation] = useState("중앙홀 1층");

  // --- Phaser 게임 생성 (한 번만) ---
  useEffect(() => {
    if (gameRef.current) return;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: "#2c2a3a",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        width: 840,
        height: 620,
      },
      physics: { default: "arcade", arcade: { gravity: { y: 0 } } },
      scene: MainScene,
    });
    if (import.meta.env.DEV) window.__JEONSAENGDO_GAME__ = gameRef.current;

    // 씬이 유물 도착을 알리면 → 배너 갱신 + 부모(App)에 전달
    hooks.onArtifact = (name) => {
      setNearby(name);
      if (name) onArtifactReached?.(name);
    };
    hooks.onMapChange = (name) => setLocation(name);

    return () => {
      hooks.onArtifact = null;
      hooks.onMapChange = null;
      if (import.meta.env.DEV) delete window.__JEONSAENGDO_GAME__;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onArtifactReached]);

  // --- 가상 조이스틱 (터치/마우스) ---
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

  return (
    <>
      <div className="game-container" ref={containerRef} />

      <div className="location-badge">{location}</div>
      {nearby && <div className="banner">🏺 {nearby} 발견!</div>}

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
    </>
  );
}
