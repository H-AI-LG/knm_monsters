import { useState, useCallback } from "react";
import PhaserGame from "./game/PhaserGame";
import BattleScreen from "./components/BattleScreen";
import { ARTIFACTS } from "./data/artifacts";

export default function App() {
  const [started, setStarted] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [collected, setCollected] = useState(new Set());

  const handleNear = useCallback(() => {}, []);

  const handleActivate = useCallback((id) => {
    const artifact = ARTIFACTS[id];
    if (artifact) setActiveArtifact(artifact);
  }, []);

  const handleCollect = useCallback((id) => {
    setCollected((prev) => new Set([...prev, id]));
  }, []);

  return (
    <div className="app">
      {started ? (
        <PhaserGame onNearArtifact={handleNear} onActivateArtifact={handleActivate} />
      ) : (
        <main className="cover-screen">
          <img className="cover-art" src="/gamecover.png" alt="유물 수호자 시간 여행 모험 표지" />
          <button className="enter-button" onClick={() => setStarted(true)}>
            박물관 입장하기
          </button>
        </main>
      )}

      {activeArtifact && (
        <BattleScreen
          artifact={activeArtifact}
          onClose={() => setActiveArtifact(null)}
          collected={collected}
          onCollect={handleCollect}
        />
      )}
    </div>
  );
}
