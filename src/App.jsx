import { useState, useCallback, useEffect, useRef } from "react";
import PhaserGame from "./game/PhaserGame";
import BattleScreen from "./components/BattleScreen";
import DoGam from "./components/DoGam";
import DevPanel from "./components/DevPanel";
import IntroCutscene from "./components/IntroCutscene";
import DirectorCutscene from "./components/DirectorCutscene";
import TopThreeScreen from "./components/TopThreeScreen";
import FinalPraiseScreen from "./components/FinalPraiseScreen";
import EndingScreen from "./components/EndingScreen";
import CreditsScreen from "./components/CreditsScreen";
import { ARTIFACTS } from "./data/artifacts";
import { playBGM, stopBGM, playExploreBGM, setBGMVolume, setSFXVolume, getBGMVolume, getSFXVolume } from "./game/audio";

function PauseMenu({ devMode, onResume, onTitle, onReset }) {
  const [bgmVol, setBgmVol] = useState(getBGMVolume);
  const [sfxVol, setSfxVol] = useState(getSFXVolume);

  const sliderStyle = { width: "100%", accentColor: "#ffcc66", cursor: "pointer" };
  const rowStyle = { display: "flex", flexDirection: "column", gap: 6, width: 220 };
  const labelStyle = { color: "#ccc", fontSize: 13, display: "flex", justifyContent: "space-between" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 8000,
      background: "rgba(0,0,0,0.78)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
      fontFamily: "serif",
    }}>
      <div style={{ color: "#fff", fontSize: 28, fontWeight: "bold", letterSpacing: 2, marginBottom: 4 }}>
        설정
      </div>

      {/* 볼륨 슬라이더 */}
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14, width: 240 }}>
        <div style={rowStyle}>
          <span style={labelStyle}><span>BGM 볼륨</span><span>{Math.round(bgmVol * 100)}%</span></span>
          <input type="range" min={0} max={1} step={0.01} value={bgmVol} style={sliderStyle}
            onChange={e => { const v = +e.target.value; setBgmVol(v); setBGMVolume(v); }} />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}><span>효과음 볼륨</span><span>{Math.round(sfxVol * 100)}%</span></span>
          <input type="range" min={0} max={1} step={0.01} value={sfxVol} style={sliderStyle}
            onChange={e => { const v = +e.target.value; setSfxVol(v); setSFXVolume(v); }} />
        </div>
      </div>

      {/* 메뉴 버튼 */}
      {[
        { label: "계속하기", action: onResume, color: "#fff" },
        { label: "타이틀로 이동", action: onTitle, color: "#ffcc66" },
        ...(!devMode ? [{ label: "데이터 초기화", action: onReset, color: "#ff7777" }] : []),
      ].map(({ label, action, color }) => (
        <button key={label} onClick={action} style={{
          background: "rgba(255,255,255,0.08)", color,
          border: `1px solid ${color}55`, borderRadius: 8,
          padding: "11px 0", fontSize: 15, cursor: "pointer",
          letterSpacing: 1, width: 240,
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >{label}</button>
      ))}
    </div>
  );
}

const INTEREST_OPTIONS = [
  { id: "warfare", label: "전쟁과 무기", artifactTags: ["무기", "전쟁", "갑옷"] },
  { id: "buddhist", label: "불교와 신비", artifactTags: ["불교", "불상", "탑", "신앙"] },
  { id: "palace", label: "왕과 궁궐", artifactTags: ["왕실", "궁궐", "의례"] },
  { id: "craft", label: "도자기와 공예", artifactTags: ["도자기", "공예", "청자", "백자"] },
  { id: "records", label: "지도와 기록", artifactTags: ["지도", "기록", "문서", "글자"] },
];

const VISIT_TIME_OPTIONS = [
  { value: "30", label: "30분" },
  { value: "60", label: "1시간" },
  { value: "90", label: "1시간 30분" },
  { value: "120", label: "2시간 이상" },
];

function LoginScreen({ onComplete, onBack }) {
  const [form, setForm] = useState({
    parentEmail: "",
    childName: "",
    interests: ["warfare"],
    visitTimeMinutes: "60",
  });

  const toggleInterest = (id) => {
    setForm((prev) => {
      const exists = prev.interests.includes(id);
      const interests = exists
        ? prev.interests.filter((item) => item !== id)
        : [...prev.interests, id];
      return { ...prev, interests: interests.length ? interests : [id] };
    });
  };

  const buildProfile = (mode) => {
    const selectedInterests = INTEREST_OPTIONS.filter((option) => form.interests.includes(option.id));
    return {
      loginMode: mode,
      parentEmail: mode === "guest" ? "" : form.parentEmail.trim(),
      childName: mode === "guest" ? (form.childName.trim() || "게스트 탐험가") : form.childName.trim(),
      interests: selectedInterests.map(({ id, label, artifactTags }) => ({ id, label, artifactTags })),
      visitTimeMinutes: Number(form.visitTimeMinutes),
      createdAt: new Date().toISOString(),
    };
  };

  const submit = (mode) => {
    const profile = buildProfile(mode);
    if (mode !== "guest" && !profile.childName) return;

    localStorage.setItem("knm_playerProfile", JSON.stringify(profile));
    onComplete(profile);
  };

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="login-heading">
          <span className="login-kicker">유물 수호자</span>
          <h1>관람자 정보</h1>
          <p>백엔드 연결 전까지는 이 정보가 브라우저에만 임시 저장됩니다.</p>
        </div>

        <label className="login-field">
          <span>부모 이메일 <em>선택</em></span>
          <input
            type="email"
            value={form.parentEmail}
            placeholder="parent@example.com"
            onChange={(e) => setForm((prev) => ({ ...prev, parentEmail: e.target.value }))}
          />
        </label>

        <label className="login-field">
          <span>아이 이름</span>
          <input
            value={form.childName}
            placeholder="탐험가 이름"
            onChange={(e) => setForm((prev) => ({ ...prev, childName: e.target.value }))}
          />
        </label>

        <div className="login-field">
          <span>관심사</span>
          <div className="interest-grid">
            {INTEREST_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={form.interests.includes(option.id) ? "interest-chip active" : "interest-chip"}
                onClick={() => toggleInterest(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <small>관심사는 유물 속성/추천 동선과 연결할 예정입니다.</small>
        </div>

        <label className="login-field">
          <span>관람시간</span>
          <select
            value={form.visitTimeMinutes}
            onChange={(e) => setForm((prev) => ({ ...prev, visitTimeMinutes: e.target.value }))}
          >
            {VISIT_TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <div className="login-actions">
          <button className="login-primary" type="button" onClick={() => submit("email")}>
            로그인하고 시작
          </button>
          <button className="login-secondary" type="button" onClick={() => submit("guest")}>
            게스트로 시작
          </button>
        </div>

        <button className="login-back" type="button" onClick={onBack}>
          표지로 돌아가기
        </button>
      </section>
    </main>
  );
}

// screen: "cover" | "intro" | "game" | "ending"
export default function App() {
  const [devMode, setDevMode] = useState(() => localStorage.getItem("knm_devMode") === "true");
  const [screen, setScreen] = useState(() => localStorage.getItem("knm_devMode") === "true" ? "game" : "cover");
  const [playerProfile, setPlayerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("knm_playerProfile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [collected, setCollected] = useState(() => {
    try {
      const saved = localStorage.getItem("knm_collected");
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set();
  });
  const [dogamOpen, setDogamOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [top3, setTop3] = useState([]);
  const endingTriggered = useRef(collected.size >= 46);
  const bossEventTriggered = useRef(collected.size >= 45);

  // 수집 내역 localStorage 동기화
  useEffect(() => {
    try {
      localStorage.setItem("knm_collected", JSON.stringify([...collected]));
    } catch {}
  }, [collected]);

  // ESC 키 → 일시정지 (Phaser bridge)
  useEffect(() => {
    window.__onEscKey = () => {
      if (screen === "game" && !activeArtifact) setPaused(p => !p);
    };
    return () => { window.__onEscKey = null; };
  }, [screen, activeArtifact]);

  // BGM: 화면/상태별 자동 전환
  useEffect(() => {
    if (screen === "cover")          playBGM("title");
    else if (screen === "login")     playBGM("title");
    else if (screen === "director")  playBGM("intro");
    else if (screen === "intro")     playBGM("intro");
    else if (screen === "topthree")  playBGM("boss");
    else if (screen === "praise")    playBGM("ending");
    else if (screen === "ending")    playBGM("ending");
    else if (screen === "game") {
      if (activeArtifact?.id === "artifact_009")    playBGM("boss");
      else if (activeArtifact?.grade === "전설")   playBGM("spirit_legendary");
      else if (activeArtifact?.grade === "고급")   playBGM("spirit_rare");
      else if (activeArtifact)                     playBGM("spirit_common");
      else                                         playExploreBGM();
    } else stopBGM();
  }, [screen, activeArtifact]);

  const handleNear = useCallback(() => {}, []);

  const handleActivate = useCallback((id) => {
    const artifact = ARTIFACTS[id];
    if (artifact) setActiveArtifact(artifact);
  }, []);

  const handleCollect = useCallback((id) => {
    setCollected((prev) => new Set([...prev, id]));
  }, []);

  const handleReset = useCallback(() => {
    setCollected(new Set());
    localStorage.removeItem("knm_collected");
    endingTriggered.current = false;
    bossEventTriggered.current = false;
  }, []);

  const handleLoginComplete = useCallback((profile) => {
    setPlayerProfile(profile);
    setScreen("director");
  }, []);

  const handleStartBoss = useCallback((selectedTop3) => {
    setTop3(selectedTop3 || []);
    setScreen("game");
    setTimeout(() => setActiveArtifact(ARTIFACTS["artifact_009"]), 300);
  }, []);

  // ── DEV: 나중에 삭제 ──────────────────────────────────
  const handleDevBoss = useCallback(() => {
    const fill = new Set(Object.keys(ARTIFACTS).filter(id => id !== "artifact_009"));
    setCollected(fill);
    endingTriggered.current = false;
    bossEventTriggered.current = true; // useEffect 중복 트리거 방지
    setScreen("topthree");
  }, []);
  // ─────────────────────────────────────────────────────

  // 29개 수집 → TOP 3 선택 이벤트 (보스전 진입)
  useEffect(() => {
    if (screen === "game" && !activeArtifact && collected.size === 45 && !bossEventTriggered.current) {
      bossEventTriggered.current = true;
      const t = setTimeout(() => setScreen("topthree"), 600);
      return () => clearTimeout(t);
    }
  }, [screen, activeArtifact, collected.size]);

  // 보스 포함 전체 수집 → 칭찬 카드 미션 → 엔딩
  useEffect(() => {
    if (screen === "game" && !activeArtifact && collected.size >= 46 && !endingTriggered.current) {
      endingTriggered.current = true;
      const t = setTimeout(() => setScreen("praise"), 400);
      return () => clearTimeout(t);
    }
  }, [screen, activeArtifact, collected.size]);

  return (
    <div className="app">
      {/* ── 표지 ── */}
      {screen === "cover" && (
        <main className="cover-screen">
          <img className="cover-art" src="/gamecover.png" alt="유물 수호자 시간 여행 모험 표지" />
          <div className="cover-btns">
            <button className="enter-button" onClick={() => setScreen("login")}>
              박물관 입장하기
            </button>
            {collected.size > 0 && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="resume-button" onClick={() => setScreen("game")}>
                  이어하기 ({collected.size}/46 수집)
                </button>
                <button className="resume-button" style={{ background: "rgba(80,80,80,0.7)", fontSize: 12, padding: "8px 12px" }} onClick={handleReset}>
                  초기화
                </button>
              </div>
            )}
            <button className="credits-button" onClick={() => setCreditsOpen(true)}>
              제작 정보
            </button>
            {/* DEV — 나중에 삭제 */}
            <button style={{marginTop:8,padding:"6px 16px",background:"#ff4444",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontSize:12}} onClick={handleDevBoss}>
              [DEV] 보스전 바로가기
            </button>
            <button style={{marginTop:4,padding:"6px 16px",background:"#114411",color:"#00ff66",border:"1px solid #006600",borderRadius:6,cursor:"pointer",fontSize:12}} onClick={() => {
              localStorage.setItem("knm_devMode", "true");
              setDevMode(true);
              setScreen("game");
            }}>
              [DEV] 에디터 모드
            </button>
          </div>
        </main>
      )}

      {/* ── 로그인 / 게스트 시작 ── */}
      {screen === "login" && (
        <LoginScreen
          onComplete={handleLoginComplete}
          onBack={() => setScreen("cover")}
        />
      )}

      {/* ── 관장님 컷씬 ── */}
      {screen === "director" && (
        <DirectorCutscene onComplete={() => setScreen("intro")} />
      )}

      {/* ── 도슨트 요정 컷씬 ── */}
      {screen === "intro" && (
        <IntroCutscene onComplete={() => setScreen("game")} />
      )}

      {/* ── TOP 3 선택 + 빌런 컷신 ── */}
      {screen === "topthree" && (
        <TopThreeScreen collected={collected} onStartBoss={handleStartBoss} />
      )}

      {/* ── 게임 ── */}
      {screen === "game" && (
        <>
          <PhaserGame onNearArtifact={handleNear} onActivateArtifact={handleActivate} />
          <button className="dogam-btn" onClick={() => setDogamOpen(true)}>
            <span className="dogam-btn-icon">📖</span>
            <span className="dogam-btn-count">{collected.size}/46</span>
          </button>
        </>
      )}

      {/* ── DEV 에디터 패널 ── */}
      {screen === "game" && devMode && (
        <DevPanel onExit={() => {
          localStorage.removeItem("knm_devMode");
          localStorage.removeItem("knm_devLastMap");
          window.__exitDevMode?.();
          setDevMode(false);
        }} />
      )}

      {/* ── 일시정지 오버레이 (ESC) ── */}
      {paused && screen === "game" && <PauseMenu
        devMode={devMode}
        onResume={() => setPaused(false)}
        onTitle={() => { setPaused(false); setScreen("cover"); }}
        onReset={() => { if (confirm("수집 데이터를 초기화할까요?")) { localStorage.removeItem("knm_collected"); window.location.reload(); } }}
      />}

      {/* ── 배틀 / 도감 (게임 위 오버레이) ── */}
      {activeArtifact && (
        <BattleScreen
          artifact={activeArtifact}
          onClose={() => setActiveArtifact(null)}
          collected={collected}
          onCollect={handleCollect}
        />
      )}

      {dogamOpen && (
        <DoGam collected={collected} onClose={() => setDogamOpen(false)} />
      )}

      {/* ── 칭찬 카드 미션 ── */}
      {screen === "praise" && (
        <FinalPraiseScreen
          top3={top3}
          playerName={playerProfile?.childName}
          onComplete={() => setScreen("ending")}
        />
      )}

      {/* ── 엔딩 ── */}
      {screen === "ending" && (
        <EndingScreen onClose={() => setScreen("cover")} />
      )}

      {/* ── 크레딧 (오버레이) ── */}
      {creditsOpen && (
        <CreditsScreen onClose={() => setCreditsOpen(false)} />
      )}
    </div>
  );
}
