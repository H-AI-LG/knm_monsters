# 유물 수호자 — 맵 출발점 (Phaser + React)

국립중앙박물관 AI 도슨트 게임의 토대. 중앙홀을 걸어다니다가 각 관 입구로 들어가면 관 내부 맵으로 전환되는 포켓몬식 맵 프로토타입입니다.

## 실행 방법

준비물: **Node.js** (설치 안 했으면 https://nodejs.org 에서 LTS 버전 설치)

```bash
npm install      # 처음 한 번만 (의존성 설치)
npm run dev      # 개발 서버 실행
```

- 터미널에 뜨는 **Local** 주소(예: http://localhost:5173)를 PC 브라우저로 열기 → 방향키로 이동
- 같은 와이파이의 **폰**에서 테스트하려면 **Network** 주소(예: http://192.168.x.x:5173)를 폰 브라우저로 열기 → 조이스틱으로 이동
- 파란 입구 칸에 가면 해당 관 맵으로 전환
- 금색 유물 칸에 가면 모달이 열림

## 폴더 구조

```
src/
  App.jsx              ← 화면 전체 + 유물 도착 시 뜨는 모달  ★팀 작업 지점
  main.jsx             ← React 진입점
  index.css            ← 스타일 (조이스틱/배너/모달)
  game/
    mapData.js         ← 중앙홀/관별 타일맵 데이터. 맵 바꾸려면 여기 수정
    MainScene.js       ← Phaser 게임: 맵 그리기, 이동, 충돌, 맵 전환, 유물 감지
    PhaserGame.jsx     ← Phaser를 React에 연결 + 조이스틱
    input.js           ← 게임 ↔ React 사이의 다리 (조이스틱값, 유물 콜백)
```

## 핵심 개념: 타일맵

`src/game/mapData.js`의 `MAPS`는 맵 여러 개를 담은 객체입니다.
- `0` = 바닥, `1` = 벽/전시대, `2` = 유물 지점, `3` = 관 입구/출구
- `lobby`는 중앙홀 허브 맵입니다.
- `medieval`, `prehistory`, `ancient`는 각 관 내부 맵입니다.
- `portals`에 적힌 좌표를 밟으면 다른 맵으로 전환됩니다.
- 실제 국중박 구조와 더 맞추려면 각 맵의 `build...()` 함수에서 벽과 전시대 위치를 다듬으면 됩니다.

## 팀 작업 지점

- **AI 대화 / 퀴즈**: `App.jsx`의 모달 안 (`=== 팀 작업 지점 ===` 주석)
- **유물 데이터**: `mapData.js`의 각 맵 `artifacts`를 실제 유물로 교체
- **맵 데이터**: 중앙홀/관별 내부 구조는 `mapData.js`의 `MAPS`와 `build...()` 함수에서 관리
- 캐릭터가 유물에 닿으면 `onArtifactReached(name)`이 호출되며 모달이 열립니다.
