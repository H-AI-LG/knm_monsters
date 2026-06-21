# 유물수호자 (Relic Guardians) — 프로젝트 컨텍스트

## 프로젝트 개요
**2025 문화 디지털혁신 공모전** 출품작. 국립중앙박물관 명품 30선 기반 **아동 대상 2D 수집형 교육 게임**.

**팀**: H-AI-LG (3-4인) / **레포**: https://github.com/H-AI-LG/knm_monsters  
**현재 브랜치**: `demo/v1` (작업 브랜치) / `main` (팀원 병합본)

---

## 세계관 — "박물관이 살아있다 + 토이스토리 + 포켓몬"

**"기술만능주의 시대에 상처받아 삐진 유물 정령들을 찾아 마음을 열어주는 수집형 RPG"**

- **주인공** = 박물관을 방문한 아이. 관장님에게 마법의 저고리를 받음
- **관장님** = 국립중앙박물관 관장 (픽셀아트 NPC). 울보 캐릭터. 시작/엔딩 컷신에만 등장
- **도슨트 요정** = 관장님이 선물해 준 안내 요정. 탐험 내내 옆에서 도움
- **유물 정령** = 사람들이 스마트폰만 보고 박물관을 안 찾아오자 상처받아 삐진 존재. 퀴즈로 진심을 보여주면 마음을 열어줌
- **보스** = 디지털 광개토대왕릉비 홀로그램. "낡은 유물보다 데이터인 내가 더 낫다"고 꼬드기는 빌런 (미구현)

### 스토리 흐름
```
타이틀
→ 관장님 컷신 (울면서 위기 설명 + 저고리 + 도슨트 요정 소개)
→ 도슨트 요정 컷신 (임무 설명 + 게임 방법 안내)
→ 게임 (맵 탐험 → 정령 발견 → 대화/퀴즈 → 수집)
→ [미구현] 보스전 (디지털 광개토대왕릉비 vs 최애 정령 TOP3)
→ [미구현] 칭찬 배틀 (AI가 칭찬 텍스트 분석 → 크리티컬 대미지)
→ 엔딩 (도슨트 요정 마무리 + 박물관 평화)
→ [미구현] 정령 카드 발급
```

---

## 기술 스택
- **프론트엔드**: React 19 + Phaser 3 + Vite
- **모바일 지원**: 조이스틱 UI (PhaserGame.jsx)
- **맵 시스템**: 배경 PNG 이미지 기반 (background.scale × 원본픽셀 좌표 = 월드 좌표)
- **BGM**: Suno Pro WAV 13트랙 (HTML Audio API), 볼륨 localStorage 저장
- **효과음**: Web Audio API 직접 생성 (SFX 마스터 GainNode로 볼륨 제어)

---

## 게임 맵 구성 (7개)
```
lobby   — 중앙홀 1층 (background.scale = 1.0)
lobby2F — 중앙홀 2층
medieval    — 조선·대한제국관
goryeo      — 고려관
sillaBalhae — 통일신라·발해관
prehistory  — 선사관
ancient     — 삼한·고대관
```

---

## 폴더 구조
```
src/
  App.jsx                — 화면 상태 관리 + BGM + ESC 설정 메뉴 + 일시정지 오버레이
  main.jsx
  index.css
  components/
    DevPanel.jsx         — DEV 에디터 패널 (맵 이동 드롭다운, 저장 상태 표시)
    DirectorCutscene.jsx
    IntroCutscene.jsx
    BattleScreen.jsx
    DoGam.jsx
    EndingScreen.jsx
    CreditsScreen.jsx
    TopThreeScreen.jsx
  data/
    artifacts.js         — 유물 30선 + 보스 목업 데이터
    mapOverrides.json    — DEV 에디터로 조정한 포털/유물 좌표 (영속 저장)
  game/
    audio.js             — BGM + 효과음 + setBGMVolume/setSFXVolume (localStorage 영속)
    mapData.js           — 맵 정의 + mapOverrides.json import 후 MAPS에 덮어쓰기 적용
    MainScene.js         — Phaser 게임 로직 (DEV 에디터, 포털 글로우, 유물 스프라이트)
    PhaserGame.jsx       — Phaser↔React 연결 + 조이스틱
    input.js             — 조이스틱·유물 콜백 브릿지

vite.config.js           — /__dev/save 미들웨어 (mapOverrides.json 파일 저장)
```

---

## 맵 시스템 핵심 구조

### 좌표 체계
- `background.scale` = 배경 이미지 렌더 배율 (lobby: 1.0, 나머지 0.5~1.2)
- 모든 좌표(portalAreas, artifactAreas, collisions, startPx)는 **원본 픽셀 단위**
- 렌더 시: `world좌표 = 원본픽셀 × scale`
- `scaleRect(rect, scale)` 함수로 변환, `pointInRect`으로 충돌 감지

### 배경 맵 방식 (background 있는 맵)
- `collisions[]`: 사각형 기반 벽 (portal 아치 사이사이 빈틈 남기는 방식)
- `portalAreas[]`: 플레이어가 밟으면 맵 전환 (`pointInRect` + 450ms 쿨다운)
- `artifactAreas[]`: 플레이어가 밟으면 유물 감지 → A키로 배틀 진입
- `walkableMask`: 일부 맵은 walkable 픽셀마스크 이미지로 이동 가능 영역 제한

### mapOverrides.json 적용 방식
```js
// mapData.js 하단
import overrides from "../data/mapOverrides.json";
Object.entries(overrides).forEach(([key, ov]) => {
  if (!MAPS[key]) return;
  if (ov.portalAreas?.length)   MAPS[key].portalAreas   = ov.portalAreas;
  if (ov.artifactAreas?.length) MAPS[key].artifactAreas = ov.artifactAreas;
});
```
→ 모듈 로드 시 1회 실행. Vite가 파일 변경 감지 → 캐시 무효화 → 리로드 시 새 JSON 반영.

---

## DEV 에디터 모드

### 진입 방법
타이틀의 `[DEV] 에디터 모드` 버튼 클릭 → localStorage `knm_devMode=true` → game 화면 진입

### 저장 플로우
1. Phaser에서 포털/유물 박스 드래그로 위치·크기 조정
2. `[확정 저장]` 버튼 → `saveDevCoords()` 호출
3. `localStorage.setItem("knm_devLastMap", currentMapKey)` 저장
4. `POST /__dev/save` → Vite 미들웨어 → `mapOverrides.json` 파일 업데이트
5. 성공 시 `window.location.reload()` → 페이지 리로드
6. 리로드 후: App.jsx가 localStorage 확인 → 자동으로 game + devMode 복귀
7. Phaser create()에서 `knm_devLastMap` 읽어 해당 맵 로드

### 리로드 후 복귀 (App.jsx 초기 state)
```js
const [devMode] = useState(() => localStorage.getItem("knm_devMode") === "true");
const [screen, setScreen] = useState(() => 
  localStorage.getItem("knm_devMode") === "true" ? "game" : "cover"
);
```

### DEV 모드 Phaser 브릿지 함수
- `window.__teleportToMap(mapKey)` — DevPanel 맵 목록에서 이동
- `window.__exitDevMode()` — "종료" 버튼 → devMode=false + loadMap 재실행
- `window.__onEscKey()` — ESC 감지 시 호출 (일시정지 토글)
- `window.__onDevSave(json)` — 저장 완료 시 DevPanel 상태 업데이트

### DEV 에디터 HUD (Phaser 화면 상단)
- **[확정 저장]** 우상단: 클릭 시 저장 + 리로드
- **[전체 보기]** 우상단 그 아래: 맵 전체 줌아웃 ↔ 플레이어 추적 뷰 토글
- **[DEV] {맵이름}** 좌상단: 현재 편집 중인 맵 표시
- 파랑 박스 = 포털 영역, 금색 박스 = 유물 영역
- 박스 드래그 → 이동, 우하단 흰 □ 드래그 → 크기 조정
- 유물 박스에는 실제 유물 이미지가 반투명하게 표시되어 드래그 시 실시간 이동

### 주의사항
- 포털은 devMode에서 비활성화됨 (update()에서 `!this.devMode` 체크)
- vite.config.js에 `watch.ignored` 없어야 함 (있으면 Vite 캐시 갱신 안 돼서 저장 안 되는 것처럼 보임)

---

## ESC 설정 메뉴 (PauseMenu 컴포넌트)
- 게임 중 ESC 키 → 일시정지 오버레이 표시 (배틀 화면 열려있을 때는 무시)
- BGM 볼륨 슬라이더 (`setBGMVolume`, localStorage `knm_bgmVol`)
- 효과음 볼륨 슬라이더 (`setSFXVolume`, localStorage `knm_sfxVol`)
- 계속하기 / 타이틀로 이동 / 데이터 초기화 버튼

---

## 유물 이미지 표시 방식
- 모든 배경맵에서 `drawArtifactSprite()` 호출 (구 `drawSeonsaArtifactSprite` 리네임 + 선사관 조건 제거)
- 스프라이트 없으면 `drawArtifactBgMarker()` (반짝이는 orb)로 폴백
- dev 모드에서는 `drawBackgroundMap`에서 유물 스프라이트 생략 → 대신 `setupDevEditor`의 핸들에 이미지 붙임

---

## 현재 완성도

✅ 7개 맵 + 캐릭터 이동·충돌·맵 전환·유물 감지·모바일 조이스틱  
✅ 픽셀 일러스트 배경 (실제 박물관 도면 반영)  
✅ 관장님 컷신 + 도슨트 요정 컷신  
✅ 배틀 화면 (균열→대화→퀴즈→획득) + 마음/삐짐 HP 시스템  
✅ 30선 + 보스 artifacts.js 목업 데이터  
✅ 유물 스프라이트 31개 + 유물별 파티클 이펙트 + 맵에 직접 표시  
✅ 저고리 도감 화면 (수집 그리드 + 상세 패널)  
✅ 엔딩 화면  
✅ BGM 13트랙 + 효과음 5종 (볼륨 영속 저장)  
✅ 포털 글로우 마커 (펄싱 링 + 레이블)  
✅ **DEV 에디터 모드** (드래그로 포털/유물 좌표 조정 → mapOverrides.json 저장)  
✅ **ESC 설정 메뉴** (볼륨 슬라이더 + 타이틀 이동)  

❌ 보스전 (디지털 광개토대왕릉비) 미구현  
❌ 칭찬 배틀 + AI 분석 (형준 파트)  
❌ 정령 카드 발급 (엔딩 보상)  
❌ 관장님 엔딩 컷신 (happy 표정 활용)  
⚠️ 로비 포털 위치 일부 아직 미조정 (DEV 에디터로 채민이 직접 조정 예정)  
⚠️ 각 관 내부 유물 이미지 위치 조정 필요 (DEV 에디터로 조정)

---

## 제출 전 삭제할 것
- `[DEV] 보스전 바로가기` 빨간 버튼 (App.jsx의 `handleDevBoss` 함수 + 버튼 JSX)
- `[DEV] 에디터 모드` 버튼 (App.jsx cover 화면)
- DevPanel.jsx import 및 렌더링 코드
- localStorage에서 `knm_devMode`, `knm_devLastMap` 키 처리 코드

---

## 팀 작업 분담
1. **지도·맵·DEV 에디터** — 채민 (진행 중)
2. **유물 상호작용·컷신·BGM** — 채민 (완료)
3. **AI 기능 연결** — 형준 (칭찬 배틀 AI 분석, `/api/chat` 연동)
4. **백엔드·데이터** — 수림

### 형준 인계 포인트
- `artifacts.js`의 `greeting`, `dialogues` 필드를 `/api/chat` 호출로 교체
- 칭찬 배틀: 유저가 TOP3 유물에 텍스트 입력 → AI가 역사 팩트 일치도 + 감성 점수 분석 → 보스 대미지
- **구조 자체는 안 바뀜**, 데이터 소스만 교체

---

## localhost 기준

| localStorage 키 | 용도 |
|---|---|
| `knm_collected` | 수집한 유물 ID 배열 |
| `knm_devMode` | DEV 에디터 활성 여부 ("true") |
| `knm_devLastMap` | 마지막 편집한 맵 키 (리로드 후 복귀용) |
| `knm_bgmVol` | BGM 볼륨 (0~1, 기본 0.5) |
| `knm_sfxVol` | 효과음 볼륨 (0~1, 기본 0.7) |

---

## 저작권 (공공누리)
- 30선 모두 공공누리 1유형 또는 직접 촬영 + 재창작으로 안전
- 출처표시: "국립중앙박물관 소장 '○○'를 참고하여 재창작 (공공누리 제1유형)"
- 낭공대사비 = 2유형이지만 채민 직접 촬영 + 재창작이라 OK
- BGM = Suno Pro 생성 (Instrumental, 저작권 없음)
