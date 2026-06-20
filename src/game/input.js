// Phaser(게임)와 React(UI)가 함께 쓰는 다리.

// 조이스틱 입력값 — React 조이스틱이 여기에 쓰고, Phaser 씬이 읽어 이동에 사용
export const joy = { x: 0, y: 0, active: false };

// 유물 감지/활성화/맵 이동 신호 — Phaser 씬이 부르면 React가 받음
// onArtifact : artifactId가 문자열이면 '감지', null이면 '벗어남'
// onActivate : 유물 근처에서 A키/버튼 → 모달 열기 요청
// onMapChange: 맵 전환 시 현재 맵 이름 전달
export const hooks = { onArtifact: null, onActivate: null, onMapChange: null };
