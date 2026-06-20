export default function CreditsScreen({ onClose }) {
  return (
    <div className="cr-root">
      <div className="cr-bg" />

      <div className="cr-card">
        <div className="cr-title">유물 수호자</div>
        <div className="cr-subtitle">국립중앙박물관 명품 30선 체험 게임</div>

        <div className="cr-divider" />

        <section className="cr-section">
          <div className="cr-section-label">제작팀</div>
          <div className="cr-team">H-AI-LG</div>
          <div className="cr-members">
            <div className="cr-member">
              <span className="cr-role">기획 · 개발</span>
              <span className="cr-name">채민</span>
            </div>
            <div className="cr-member">
              <span className="cr-role">AI 연동</span>
              <span className="cr-name">형준</span>
            </div>
            <div className="cr-member">
              <span className="cr-role">음향 · BGM</span>
              <span className="cr-name">수림</span>
            </div>
          </div>
        </section>

        <div className="cr-divider" />

        <section className="cr-section">
          <div className="cr-section-label">유물 출처</div>
          <div className="cr-source">국립중앙박물관 소장 유물</div>
          <div className="cr-source-sub">
            본 게임에 사용된 유물 이미지 및 정보는<br />
            국립중앙박물관의 공공데이터를 활용하였습니다.
          </div>
        </section>

        <div className="cr-divider" />

        <section className="cr-section">
          <div className="cr-section-label">기술 스택</div>
          <div className="cr-tech">React 19 · Phaser 3 · Vite</div>
        </section>

        <div className="cr-divider" />

        <section className="cr-section">
          <div className="cr-section-label">제출 공모전</div>
          <div className="cr-contest">2025 문화 디지털혁신 공모전</div>
        </section>

        <button className="cr-close" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
