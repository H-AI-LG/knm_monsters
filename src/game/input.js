// Phaser(게임)와 React(UI)가 함께 쓰는 다리.

// 조이스틱 입력값 — React 조이스틱이 여기에 쓰고, Phaser 씬이 읽어 이동에 사용
export const joy = { x: 0, y: 0, active: false };

// 유물 도착/맵 이동 신호 — Phaser 씬이 부르면 React가 받음
// onArtifact: name이 문자열이면 '도착', null이면 '벗어남'
export const hooks = { onArtifact: null, onMapChange: null };
