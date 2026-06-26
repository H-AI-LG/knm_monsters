import { useState, useCallback, useEffect, useRef } from "react";
import PhaserGame from "./game/PhaserGame";
import BattleScreen from "./components/BattleScreen";
import DoGam from "./components/DoGam";
import DevPanel from "./components/DevPanel";
import IntroCutscene from "./components/IntroCutscene";
import DirectorCutscene from "./components/DirectorCutscene";
import TopThreeScreen from "./components/TopThreeScreen";
import FinalPraiseScreen from "./components/FinalPraiseScreen";
import AllCollectedCutscene from "./components/AllCollectedCutscene";
import EndingScreen from "./components/EndingScreen";
import CreditsScreen from "./components/CreditsScreen";
import { ARTIFACTS } from "./data/artifacts";
import { playBGM, stopBGM, playExploreBGM, setBGMVolume, setSFXVolume, getBGMVolume, getSFXVolume } from "./game/audio";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// 보스(artifact_009)를 제외한 전체 유물 수 — 유물 추가 시 자동 반영
const TOTAL_NON_BOSS = Object.keys(ARTIFACTS).filter((id) => id !== "artifact_009").length;

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
    parentPhone: "",
    childName: "",
    interests: ["warfare"],
    visitTimeMinutes: "60",
  });
  const [loading, setLoading] = useState(false);

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
      parentPhone: mode === "guest" ? "" : form.parentPhone.trim(),
      childName: mode === "guest" ? (form.childName.trim() || "게스트 탐험가") : form.childName.trim(),
      interests: selectedInterests.map(({ id, label, artifactTags }) => ({ id, label, artifactTags })),
      visitTimeMinutes: Number(form.visitTimeMinutes),
      createdAt: new Date().toISOString(),
    };
  };

  const submit = async (mode) => {
    const profile = buildProfile(mode);
    if (mode !== "guest" && !profile.childName) return;

    if (mode !== "guest") {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: profile.childName,
            parent_phone: profile.parentPhone || "미입력",
            interests: profile.interests.map((i) => i.id),
            view_time: profile.visitTimeMinutes,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          profile.userId = data.user_id;
        }
      } catch (e) {
        console.warn("백엔드 로그인 실패, 로컬 모드로 진행:", e);
      } finally {
        setLoading(false);
      }
    }

    onComplete(profile);
  };

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="login-heading">
          <span className="login-kicker">유물 수호자</span>
          <h1>관람자 정보</h1>
          <p>입력하신 정보로 맞춤 유물 탐험이 시작됩니다!</p>
        </div>

        <label className="login-field">
          <span>부모 연락처 <em>선택</em></span>
          <input
            type="tel"
            value={form.parentPhone}
            placeholder="010-0000-0000"
            onChange={(e) => setForm((prev) => ({ ...prev, parentPhone: e.target.value }))}
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
          <button className="login-primary" type="button" onClick={() => submit("email")} disabled={loading}>
            {loading ? "불러오는 중..." : "로그인하고 시작"}
          </button>
          <button className="login-secondary" type="button" onClick={() => submit("guest")} disabled={loading}>
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

function DevMenu({ onDevBoss, onDevEditor }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "fixed", bottom: 14, right: 14, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      {open && (
        <>
          <button onClick={() => { setOpen(false); onDevBoss(); }} style={{ padding: "6px 14px", background: "rgba(30,10,10,0.92)", color: "#ff8888", border: "1px solid #ff444466", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "inherit", whiteSpace: "nowrap" }}>
            보스전 바로가기
          </button>
          <button onClick={() => { setOpen(false); onDevEditor(); }} style={{ padding: "6px 14px", background: "rgba(10,20,10,0.92)", color: "#66ff88", border: "1px solid #00aa4466", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "inherit", whiteSpace: "nowrap" }}>
            에디터 모드
          </button>
        </>
      )}
      <button onClick={() => setOpen(o => !o)} style={{ padding: "4px 8px", background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5, cursor: "pointer", fontSize: 10, fontFamily: "monospace", letterSpacing: 1 }}>
        DEV
      </button>
    </div>
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
  const [blockedPortalMsg, setBlockedPortalMsg] = useState(null);
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
  const endingTriggered = useRef(collected.size >= TOTAL_NON_BOSS);
  const bossEventTriggered = useRef(collected.size >= TOTAL_NON_BOSS - 1);

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

  // 막힌 포털 진입 시 도슨트 요정 메시지 (Phaser bridge)
  useEffect(() => {
    window.__onPortalBlocked = (msg) => setBlockedPortalMsg(msg);
    return () => { window.__onPortalBlocked = null; };
  }, []);

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
      if (activeArtifact?.id === "artifact_009b")   playBGM("boss_phase2");
      else if (activeArtifact?.id === "artifact_009")    playBGM("boss");
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
    window.__onArtifactCollected?.(id);

    // 백엔드에 수집 기록 저장
    const userId = playerProfile?.userId;
    if (userId) {
      fetch(`${API_BASE}/api/users/${userId}/artifacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifact_id: id }),
      }).catch((e) => console.warn("수집 기록 저장 실패:", e));
    }
  }, [playerProfile?.userId]);

  const handleReset = useCallback(() => {
    setCollected(new Set());
    localStorage.removeItem("knm_collected");
    endingTriggered.current = false;
    bossEventTriggered.current = false;
  }, []);

  // 2·3층 미구현 — 항상 수집된 상태로 처리
  const UPPER_FLOOR_IDS = new Set([
    "artifact_016", "artifact_017", "artifact_018", "artifact_019", "artifact_020",
    "artifact_021", "artifact_022_sun", "artifact_023", "artifact_024", "artifact_025",
    "artifact_026", "artifact_027", "artifact_028", "artifact_029", "artifact_030",
  ]);

  const handleLoginComplete = useCallback(async (profile) => {
    // 백엔드 추천 API로 타겟 유물 결정 (2·3층 및 보스 제외)
    let targetIds = [];
    if (profile.userId) {
      try {
        const res = await fetch(`${API_BASE}/api/artifacts/recommend/${profile.userId}`);
        if (res.ok) {
          const data = await res.json();
          targetIds = data
            .map((a) => a.id)
            .filter((id) => id !== "artifact_009" && !UPPER_FLOOR_IDS.has(id));
        }
      } catch (e) {
        console.warn("추천 API 실패, 프론트 로직으로 폴백:", e);
      }
    }
    // 백엔드 실패 시 프론트 로직으로 폴백
    if (targetIds.length === 0) {
      const interestCodes = new Set(profile.interests.map((i) => i.id));
      targetIds = Object.values(ARTIFACTS)
        .filter((a) => a.interestTag && interestCodes.has(a.interestTag) && !UPPER_FLOOR_IDS.has(a.id))
        .map((a) => a.id);
    }

    // 타겟이 아닌 유물(보스 제외)은 처음부터 수집된 상태로 초기화
    // 2·3층 유물도 항상 수집 완료 처리
    const allNonBossIds = Object.keys(ARTIFACTS).filter((id) => id !== "artifact_009");
    const preCollected = new Set(allNonBossIds.filter((id) => !targetIds.includes(id)));

    // 백엔드에서 이전 수집 기록 복원 (재방문 유저)
    if (profile.userId) {
      try {
        const res = await fetch(`${API_BASE}/api/users/${profile.userId}/artifacts`);
        if (res.ok) {
          const data = await res.json();
          data.forEach((a) => preCollected.add(a.id));
        }
      } catch (e) {
        console.warn("수집 기록 복원 실패, 로컬 모드로 진행:", e);
      }
    }

    // 트리거 리셋 (새 게임 시작)
    endingTriggered.current = false;
    bossEventTriggered.current = false;

    profile.targetArtifactIds = targetIds;
    localStorage.setItem("knm_playerProfile", JSON.stringify(profile));
    localStorage.setItem("knm_collected", JSON.stringify([...preCollected]));

    setPlayerProfile(profile);
    setCollected(preCollected);
    setScreen("director");
  }, []);

  const handleStartBoss = useCallback((selectedTop3) => {
    setTop3(selectedTop3 || []);
    setScreen("game");
    setTimeout(() => setActiveArtifact(ARTIFACTS["artifact_009"]), 300);
  }, []);

  // ── DEV: 나중에 삭제 ──────────────────────────────────
  const handleDevBoss = useCallback(() => {
    const fill = new Set(Object.keys(ARTIFACTS).filter(id => id !== "artifact_009" && id !== "artifact_009b"));
    setCollected(fill);
    endingTriggered.current = false;
    bossEventTriggered.current = true; // useEffect 중복 트리거 방지
    setScreen("topthree");
  }, []);
  // ─────────────────────────────────────────────────────

  // 29개 수집 → 도슨트 요정 컷씬 → TOP 3 선택 이벤트 (보스전 진입)
  useEffect(() => {
    if (screen === "game" && !activeArtifact && collected.size === TOTAL_NON_BOSS - 1 && !bossEventTriggered.current) {
      bossEventTriggered.current = true;
      const t = setTimeout(() => setScreen("allcollected"), 600);
      return () => clearTimeout(t);
    }
  }, [screen, activeArtifact, collected.size]);

  // 보스 포함 전체 수집 → 칭찬 카드 미션 → 엔딩
  useEffect(() => {
    if (screen === "game" && !activeArtifact && collected.size >= TOTAL_NON_BOSS && !endingTriggered.current) {
      endingTriggered.current = true;
      const t = setTimeout(() => setScreen("praise"), 400);
      return () => clearTimeout(t);
    }
  }, [screen, activeArtifact, collected.size]);

  return (
    <div className="app">
      {/* ── DEV 메뉴 (항상 표시) ── */}
      <DevMenu
        onDevBoss={handleDevBoss}
        onDevEditor={() => { localStorage.setItem("knm_devMode", "true"); setDevMode(true); setScreen("game"); }}
      />

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
                  이어하기 ({collected.size}/{TOTAL_NON_BOSS} 수집)
                </button>
                <button className="resume-button" style={{ background: "rgba(80,80,80,0.7)", fontSize: 12, padding: "8px 12px" }} onClick={handleReset}>
                  초기화
                </button>
              </div>
            )}
            <button className="credits-button" onClick={() => setCreditsOpen(true)}>
              제작 정보
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

      {/* ── 전체 수집 완료 도슨트 요정 컷씬 ── */}
      {screen === "allcollected" && (
        <AllCollectedCutscene onComplete={() => setScreen("topthree")} />
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
            <span className="dogam-btn-count">{collected.size}/{TOTAL_NON_BOSS}</span>
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
          totalArtifacts={TOTAL_NON_BOSS}
        />
      )}

      {dogamOpen && (
        <DoGam
          collected={collected}
          targetArtifactIds={playerProfile?.targetArtifactIds}
          onClose={() => setDogamOpen(false)}
        />
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

      {/* ── 막힌 포털 도슨트 요정 메시지 ── */}
      {blockedPortalMsg && (
        <div className="ic-root" style={{ background: "rgba(0,0,0,0.55)" }} onClick={() => setBlockedPortalMsg(null)}>
          <div className="ic-spirit-area">
            <div className="ic-spirit ic-spirit-in">
              <div className="ic-spirit-aura" />
              <div className="ic-spirit-ring ic-ring-3" />
              <div className="ic-spirit-ring ic-ring-2" />
              <div className="ic-spirit-ring ic-ring-1" />
              <div className="ic-spirit-core" />
            </div>
            <div className="ic-spirit-label">도슨트 요정</div>
          </div>
          <div className="ic-textbox" onClick={e => e.stopPropagation()}>
            <div className="ic-textbox-corner tl" /><div className="ic-textbox-corner tr" />
            <div className="ic-textbox-corner bl" /><div className="ic-textbox-corner br" />
            <div className="ic-persona-tag">✦ 도슨트 요정</div>
            <p className="ic-line">{blockedPortalMsg}</p>
            <div className="ic-tap-hint" style={{ cursor: "pointer" }} onClick={() => setBlockedPortalMsg(null)}>
              화면을 터치하면 닫힙니다 ▼
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
