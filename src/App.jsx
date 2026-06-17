import { useState } from "react";
import PhaserGame from "./game/PhaserGame";

export default function App() {
  const [chatArtifact, setChatArtifact] = useState(null);
  const [started, setStarted] = useState(false);

  return (
    <div className="app">
      {started ? (
        <PhaserGame onArtifactReached={(name) => setChatArtifact(name)} />
      ) : (
        <main className="cover-screen">
          <img className="cover-art" src="/gamecover.png" alt="유물 수호자 시간 여행 모험 표지" />
          <button className="enter-button" onClick={() => setStarted(true)}>
            박물관 입장하기
          </button>
        </main>
      )}

      {/* 유물에 도착하면 열리는 모달.
          === 팀 작업 지점 ===
          여기 안에 AI 대화창 / 퀴즈 컴포넌트를 넣으면 됩니다. */}
      {chatArtifact && (
        <div className="modal-backdrop" onClick={() => setChatArtifact(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🏺 {chatArtifact}</h2>
            <p>
              여기에 AI 대화와 퀴즈가 들어갑니다.
              <br />
              (팀원 작업 지점)
            </p>
            <button onClick={() => setChatArtifact(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
