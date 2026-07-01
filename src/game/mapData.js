// ============================================================
// 국립중앙박물관 1층 프로토타입 맵
// 0 = 바닥, 1 = 벽/전시대, 2 = 유물 지점, 3 = 관 입구/출구
//
// 전체 1층을 하나의 축소 맵으로 우겨 넣지 않고,
// 중앙홀 허브에서 각 관 입구를 밟으면 해당 관 내부 맵으로 전환합니다.
// ============================================================
import overrides from "../data/mapOverrides.json";
export const TILE = 40;

export const TILE_KIND = {
  FLOOR: 0,
  WALL: 1,
  ARTIFACT: 2,
  PORTAL: 3,
};

export const START_MAP = "lobby";
export const START_TILE = { row: 16, col: 4 };

const makeMap = (rows, cols) => Array.from({ length: rows }, () => Array(cols).fill(TILE_KIND.WALL));

const carveRect = (map, row, col, height, width, value = TILE_KIND.FLOOR) => {
  for (let r = row; r < row + height; r++) {
    for (let c = col; c < col + width; c++) {
      if (map[r] && map[r][c] !== undefined) map[r][c] = value;
    }
  }
};

const carveCircle = (map, row, col, radius, value = TILE_KIND.FLOOR) => {
  for (let r = row - radius; r <= row + radius; r++) {
    for (let c = col - radius; c <= col + radius; c++) {
      if (!map[r] || map[r][c] === undefined) continue;
      if (Math.hypot(r - row, c - col) <= radius) map[r][c] = value;
    }
  }
};

const setTile = (map, row, col, value) => {
  if (map[row] && map[row][col] !== undefined) map[row][col] = value;
};

const addExhibits = (map, rects) => {
  rects.forEach(([row, col, height, width]) => carveRect(map, row, col, height, width, TILE_KIND.WALL));
};

const buildLobby = () => {
  const map = makeMap(28, 32);

  // 서쪽 입구에서 중앙 원형 로비로 들어오는 넓은 통로
  carveRect(map, 13, 1, 7, 11);
  carveRect(map, 10, 8, 12, 10);
  carveCircle(map, 15, 18, 6);
  carveRect(map, 11, 18, 9, 7);

  // 1층 도면 기준 상단 중근세관, 하단 선사고대관으로 이어지는 입구들
  carveRect(map, 4, 13, 8, 11);
  carveRect(map, 3, 15, 3, 7);
  carveRect(map, 20, 7, 5, 9);
  carveRect(map, 20, 20, 5, 9);

  // 실제 중앙홀의 계단/엘리베이터/시설 덩어리를 장애물로 간략화
  addExhibits(map, [
    [8, 17, 2, 3],
    [12, 23, 1, 3],
    [19, 16, 2, 4],
    [21, 3, 2, 2],
    [21, 27, 2, 2],
  ]);

  setTile(map, 5, 18, TILE_KIND.PORTAL);
  setTile(map, 22, 11, TILE_KIND.PORTAL);
  setTile(map, 22, 24, TILE_KIND.PORTAL);

  return map;
};

const buildLobby2F = () => {
  const map = makeMap(12, 20);
  carveRect(map, 2, 1, 8, 18);
  setTile(map, 9, 2,  TILE_KIND.PORTAL);
  setTile(map, 9, 17, TILE_KIND.PORTAL);
  return map;
};

const buildMedieval = () => {
  const map = makeMap(18, 38);

  // 중근세관은 전체 도면에서 좌우로 긴 전시실 축이다.
  carveRect(map, 7, 2, 6, 9); // 대한제국/조선 진입부
  carveRect(map, 4, 8, 9, 9); // 조선
  carveRect(map, 4, 16, 9, 8); // 고려
  carveRect(map, 4, 23, 9, 7); // 고려/발해 연결
  carveRect(map, 5, 29, 7, 7); // 발해/통일신라
  carveRect(map, 12, 17, 4, 6); // 중앙홀로 돌아가는 목

  addExhibits(map, [
    [8, 6, 1, 3],
    [6, 12, 4, 1],
    [7, 19, 1, 3],
    [10, 20, 1, 3],
    [6, 27, 4, 1],
    [8, 32, 1, 2],
  ]);

  setTile(map, 14, 20, TILE_KIND.PORTAL);
  setTile(map, 9, 5, TILE_KIND.ARTIFACT);
  setTile(map, 8, 14, TILE_KIND.ARTIFACT);
  setTile(map, 8, 22, TILE_KIND.ARTIFACT);
  setTile(map, 8, 32, TILE_KIND.ARTIFACT);

  return map;
};

const buildPrehistory = () => {
  const map = makeMap(22, 30);

  // 선사관은 구석기 -> 신석기 -> 청동기로 이어지는 연속 전시실로 구성
  carveRect(map, 4, 3, 7, 9);
  carveRect(map, 9, 7, 7, 10);
  carveRect(map, 6, 15, 8, 9);
  carveRect(map, 13, 18, 6, 8);
  carveRect(map, 1, 12, 4, 6); // 중앙홀 출입 목

  addExhibits(map, [
    [6, 7, 1, 3],
    [11, 10, 3, 1],
    [10, 18, 1, 3],
    [15, 21, 1, 3],
    [16, 15, 2, 1],
  ]);

  setTile(map, 2, 15, TILE_KIND.PORTAL);
  setTile(map, 7, 6, TILE_KIND.ARTIFACT);
  setTile(map, 12, 12, TILE_KIND.ARTIFACT);
  setTile(map, 15, 22, TILE_KIND.ARTIFACT);

  return map;
};

const buildAncient = () => {
  const map = makeMap(24, 34);

  // 고대관은 백제/가야/신라와 삼국시대 유물 캡처를 반영한 방 단위 구조
  carveRect(map, 2, 14, 5, 7); // 중앙홀 출입 목
  carveRect(map, 6, 5, 8, 11); // 백제
  carveRect(map, 11, 12, 7, 10); // 가야
  carveRect(map, 6, 21, 8, 9); // 신라
  carveRect(map, 15, 20, 6, 10); // 금관/토기 방
  carveRect(map, 15, 6, 5, 8); // 보조 전시실

  addExhibits(map, [
    [8, 9, 1, 3],
    [11, 14, 1, 2],
    [13, 17, 1, 2],
    [9, 24, 3, 1],
    [17, 23, 1, 3],
    [18, 10, 1, 2],
  ]);

  setTile(map, 3, 17, TILE_KIND.PORTAL);
  setTile(map, 9, 10, TILE_KIND.ARTIFACT);
  setTile(map, 14, 16, TILE_KIND.ARTIFACT);
  setTile(map, 10, 26, TILE_KIND.ARTIFACT);
  setTile(map, 18, 25, TILE_KIND.ARTIFACT);

  return map;
};

export const MAPS = {
  lobby: {
    id: "lobby",
    name: "중앙홀 1층",
    background: {
      key: "mainhallBg",
      path: "/maps/mainhall_bg.png",
      width: 2800,
      height: 1504,
      scale: 1.0,
    },
    theme: { floor: 0xeee7d8, wall: 0x4b463d, portal: 0x5f7fbd, artifact: 0xc9a24b },
    map: buildLobby(),
    start: START_TILE,
    startPx: { x: 280, y: 820 },
    collisions: [
      // 상단 발코니 벽 (포탈 아치 사이 막힌 부분)
      { x: 0,    y: 0,   w: 460,  h: 320 },
      { x: 770,  y: 0,   w: 320,  h: 195 },
      { x: 1380, y: 0,   w: 230,  h: 225 },
      { x: 1920, y: 0,   w: 230,  h: 285 },
      { x: 2700, y: 0,   w: 100,  h: 545 },
      // 좌측 외벽
      { x: 0,    y: 320, w: 60,   h: 740 },
      // 우측 외벽
      { x: 2740, y: 545, w: 60,   h: 815 },
      // 하단 경계 (포탈 통로 제외)
      { x: 0,    y: 1375, w: 560,  h: 129 },
      { x: 920,  y: 1375, w: 960,  h: 129 },
      { x: 2240, y: 1375, w: 560,  h: 129 },
    ],
    portalAreas: [
      // 상단 — 조선·대한제국관 방향 (y를 내려서 메인홀 바닥에서 닿도록)
      { x: 460,  y: 310,  w: 310, h: 240, target: "medieval",    spawn: { x: 1125, y: 705 }, label: "대한제국" },
      { x: 1090, y: 290,  w: 290, h: 250, target: "medieval",    spawn: { x: 1125, y: 705 }, label: "조선" },
      // 상단 — 고려관 방향
      { x: 1610, y: 295,  w: 310, h: 245, target: "goryeo",      spawn: { x: 360, y: 390 },  label: "고려" },
      // 상단 — 신라·발해관 방향
      { x: 2150, y: 300,  w: 290, h: 240, target: "sillaBalhae", spawn: { x: 220, y: 382 },  label: "발해" },
      { x: 2440, y: 300,  w: 260, h: 240, target: "sillaBalhae", spawn: { x: 455, y: 525 },  label: "통일신라" },
      // 하단 좌측 — 선사관
      { x: 560,  y: 1240, w: 360, h: 130, target: "prehistory",  spawn: { x: 545, y: 390 }, label: "선사관" },
      // 하단 우측 — 삼한·고대관
      { x: 1880, y: 1240, w: 360, h: 130, target: "ancient",     spawn: { x: 812, y: 245 },  label: "삼한·고대관" },
      // 계단 → 2층 (크기 줄임 — 실제 계단 구역만)
      { x: 60,   y: 1080, w: 260, h: 240, target: "lobby2F",     spawn: { x: 200, y: 200 },  label: "2층" },
      { x: 2480, y: 1060, w: 260, h: 240, target: "lobby2F",     spawn: { x: 200, y: 200 },  label: "2층" },
    ],
    portals: {},
    artifacts: {},
    labels: [],
    decorations: [],
  },

  lobby2F: {
    id: "lobby2F",
    name: "중앙홀 2층",
    map: buildLobby2F(),
    theme: { floor: 0xd8d2c5, wall: 0x4b463d, portal: 0x5f7fbd, artifact: 0xc9a24b },
    start: { row: 5, col: 10 },
    collisions: [],
    portalAreas: [],
    portals: {
      "9,2":  { target: "lobby", spawn: { x: 250, y: 1200 }, label: "1층" },
      "9,17": { target: "lobby", spawn: { x: 2520, y: 1120 }, label: "1층" },
    },
    artifacts: {},
    artifactAreas: [],
    labels: [
      { row: 4, col: 7, text: "공사 중" },
    ],
    decorations: [],
  },
  medieval: {
    id: "medieval",
    name: "조선관",
    background: {
      key: "joseonBg",
      path: "/maps/joseon_bg.png",
      width: 1597,
      height: 781,
    },
    walkableMask: {
      key: "joseonWalkable",
      path: "/maps/joseon_walkable.png",
      width: 1597,
      height: 781,
    },
    theme: { floor: 0xf1dfd7, wall: 0x493f39, portal: 0x5f7fbd, artifact: 0xc9a24b },
    map: buildMedieval(),
    start: { row: 14, col: 20 },
    startPx: { x: 1125, y: 705 },
    walkableAreas: [
      { x: 292, y: 130, w: 445, h: 150 },
      { x: 315, y: 250, w: 420, h: 250 },
      { x: 300, y: 480, w: 310, h: 165 },
      { x: 505, y: 90, w: 210, h: 120 },
      { x: 565, y: 90, w: 435, h: 210 },
      { x: 555, y: 255, w: 455, h: 260 },
      { x: 520, y: 505, w: 385, h: 170 },
      { x: 920, y: 150, w: 270, h: 365 },
      { x: 1010, y: 495, w: 360, h: 175 },
      { x: 1065, y: 620, w: 135, h: 160 },
      { x: 1225, y: 68, w: 265, h: 155 },
      { x: 1230, y: 165, w: 250, h: 380 },
      { x: 1455, y: 95, w: 142, h: 132 },
      { x: 1370, y: 390, w: 170, h: 235 },
    ],
    collisions: [
      { x: 352, y: 72, w: 100, h: 62 },
      { x: 558, y: 70, w: 95, h: 72 },
      { x: 680, y: 34, w: 74, h: 112 },
      { x: 1015, y: 75, w: 122, h: 70 },
      { x: 1195, y: 82, w: 68, h: 105 },
      { x: 1285, y: 178, w: 150, h: 122 },
      { x: 1455, y: 322, w: 100, h: 140 },
      { x: 420, y: 230, w: 82, h: 145 },
      { x: 382, y: 427, w: 132, h: 78 },
      { x: 685, y: 195, w: 150, h: 92 },
      { x: 685, y: 318, w: 132, h: 95 },
      { x: 573, y: 400, w: 92, h: 78 },
      { x: 615, y: 588, w: 62, h: 90 },
      { x: 748, y: 596, w: 118, h: 64 },
      { x: 850, y: 410, w: 105, h: 86 },
      { x: 930, y: 190, w: 210, h: 92 },
      { x: 1070, y: 370, w: 168, h: 96 },
      { x: 1110, y: 530, w: 155, h: 96 },
      { x: 948, y: 628, w: 106, h: 120 },
    ],
    portalAreas: [
      { x: 1070, y: 670, w: 135, h: 111, target: "lobby", spawn: { x: 700, y: 480 }, label: "중앙홀" },
      { x: 1458, y: 95, w: 139, h: 135, target: "goryeo", spawn: { x: 100, y: 340 }, label: "고려관" },
    ],
    portals: {},
    artifacts: {
      "9,5":  "artifact_015", // 대한제국 — 칙명지보
      "8,14": "artifact_013", // 조선 — 대동여지도
      "8,22": "artifact_012", // 조선 — 한글금속활자
      "8,32": "artifact_014", // 조선 — 외규장각의궤
    },
    artifactAreas: [
      { x: 382, y: 427, w: 132, h: 78, artifactId: "artifact_014" },
      { x: 680, y: 34, w: 74, h: 112, artifactId: "artifact_013" },
      { x: 685, y: 318, w: 132, h: 95, artifactId: "artifact_012" },
      { x: 1285, y: 178, w: 150, h: 122, artifactId: "artifact_015" },
      { x: 948, y: 628, w: 106, h: 120, artifactId: "artifact_026" },
      { x: 420, y: 230, w: 82, h: 145, artifactId: "artifact_029" },
    ],
    labels: [
      { row: 9, col: 5, text: "대한제국" },
      { row: 8, col: 14, text: "조선" },
      { row: 8, col: 22, text: "고려" },
      { row: 8, col: 32, text: "통일신라" },
      { row: 15, col: 20, text: "중앙홀" },
    ],
    decorations: [
      { type: "column", row: 5, col: 4 },
      { type: "column", row: 5, col: 34 },
      { type: "plant", row: 11, col: 3 },
      { type: "plant", row: 10, col: 35 },
      { type: "bench", row: 12, col: 12 },
      { type: "bench", row: 12, col: 27 },
      { type: "spotlight", row: 4, col: 10 },
      { type: "spotlight", row: 4, col: 18 },
      { type: "spotlight", row: 4, col: 30 },
    ],
  },
  goryeo: {
    id: "goryeo",
    name: "고려관",
    background: {
      key: "goryeoBg",
      path: "/maps/goryeo_bg.png",
      width: 876,
      height: 653,
      scale: 1.1,
    },
    theme: { floor: 0xd9c4a7, wall: 0x3f352a, portal: 0x5f7fbd, artifact: 0xc9a24b },
    map: buildMedieval(),
    start: { row: 14, col: 20 },
    startPx: { x: 485, y: 585 },
    collisions: [
      { x: 0, y: 0, w: 876, h: 6 },
      { x: 0, y: 0, w: 64, h: 292 },
      { x: 0, y: 392, w: 64, h: 170 },
      { x: 0, y: 585, w: 475, h: 68 },
      { x: 535, y: 585, w: 108, h: 68 },
      { x: 645, y: 620, w: 198, h: 33 },
      { x: 850, y: 395, w: 26, h: 258 },
      { x: 850, y: 0, w: 26, h: 325 },
      { x: 65, y: 8, w: 540, h: 18 },
      { x: 248, y: 8, w: 18, h: 220 },
      { x: 590, y: 8, w: 18, h: 222 },
      { x: 608, y: 0, w: 268, h: 220 },
      { x: 185, y: 220, w: 424, h: 18 },
      { x: 64, y: 560, w: 146, h: 24 },
      { x: 398, y: 365, w: 52, h: 208 },
      { x: 450, y: 357, w: 68, h: 22 },
      { x: 520, y: 377, w: 28, h: 196 },
      { x: 620, y: 585, w: 20, h: 35 },
      { x: 850, y: 325, w: 26, h: 70 },
    ],
    portalAreas: [
      { x: 475, y: 585, w: 60, h: 68, target: "lobby", spawn: { x: 1770, y: 480 }, label: "중앙홀" },
      { x: 0, y: 292, w: 72, h: 98, target: "medieval", spawn: { x: 1515, y: 175 }, label: "조선관" },
      { x: 850, y: 325, w: 26, h: 70, target: "sillaBalhae", spawn: { x: 105, y: 150 }, label: "신라·발해관" },
    ],
    portals: {},
    artifacts: {},
    // 배경 이미지 맵 유물 감지 영역 (언스케일드 픽셀 좌표, scale: 1.1 적용 전)
    artifactAreas: [
      { x: 62, y: 370, w: 85, h: 180, artifactId: "artifact_024" }, // 청자향로 — 좌측 통로 전시대
      { x: 220, y: 300, w: 120, h: 110, artifactId: "artifact_023" }, // 은입사정병 — 메인룸 상단
      { x: 220, y: 470, w: 118, h: 82, artifactId: "artifact_019" }, // 나전칠상자 — 메인룸 하단
      { x: 570, y: 300, w: 118, h: 115, artifactId: "artifact_018" }, // 변상도 — 우측 상단 전시대
      { x: 595, y: 435, w: 112, h: 92, artifactId: "artifact_011" }, // 경전 — 우측 중단
    ],
    labels: [],
    decorations: [],
  },
  sillaBalhae: {
    id: "sillaBalhae",
    name: "통일신라·발해관",
    background: {
      key: "sillaBalhaeBg",
      path: "/maps/silla_balhae_bg.png",
      width: 976,
      height: 612,
      scale: 1.1,
    },
    theme: { floor: 0xd5b68e, wall: 0x3b3026, portal: 0x5f7fbd, artifact: 0xc9a24b },
    map: buildMedieval(),
    start: { row: 8, col: 32 },
    startPx: { x: 105, y: 150 },
    walkableAreas: [
      { x: 18, y: 108, w: 62, h: 70 },
      { x: 58, y: 78, w: 285, h: 152 },
      { x: 160, y: 185, w: 164, h: 215 },
      { x: 200, y: 335, w: 160, h: 92 },
      { x: 338, y: 120, w: 278, h: 145 },
      { x: 455, y: 230, w: 290, h: 190 },
      { x: 445, y: 380, w: 245, h: 176 },
      { x: 585, y: 250, w: 168, h: 230 },
      { x: 720, y: 245, w: 184, h: 150 },
      { x: 805, y: 220, w: 85, h: 210 },
      { x: 395, y: 405, w: 105, h: 95 },
      { x: 105, y: 245, w: 95, h: 210 },
    ],
    collisions: [
      { x: 122, y: 260, w: 45, h: 74 },
      { x: 118, y: 350, w: 68, h: 82 },
      { x: 218, y: 300, w: 82, h: 78 },
      { x: 348, y: 365, w: 50, h: 55 },
      { x: 382, y: 55, w: 78, h: 58 },
      { x: 462, y: 42, w: 174, h: 58 },
      { x: 445, y: 242, w: 64, h: 75 },
      { x: 435, y: 372, w: 88, h: 100 },
      { x: 565, y: 325, w: 100, h: 86 },
      { x: 683, y: 270, w: 36, h: 88 },
      { x: 748, y: 185, w: 56, h: 96 },
      { x: 860, y: 190, w: 76, h: 92 },
      { x: 825, y: 310, w: 122, h: 108 },
      { x: 612, y: 466, w: 102, h: 90 },
    ],
    portalAreas: [
      { x: 0, y: 108, w: 78, h: 88, target: "goryeo", spawn: { x: 555, y: 246 }, label: "고려관" },
      { x: 184, y: 392, w: 74, h: 72, target: "lobby", spawn: { x: 2260, y: 460 }, label: "발해관" },
      { x: 420, y: 438, w: 78, h: 74, target: "lobby", spawn: { x: 2480, y: 460 }, label: "통일신라관" },
    ],
    portals: {},
    artifacts: {},
    // 배경 이미지 맵 유물 감지 영역 (언스케일드 픽셀 좌표, scale: 1.18 적용 전)
    artifactAreas: [
      { x: 126, y: 236, w: 96, h: 118, artifactId: "artifact_010" }, // 철불 — 좌측 하단 석불
      { x: 830, y: 250, w: 108, h: 150, artifactId: "artifact_021" }, // 감산사석불 — 우측 불상
      { x: 745, y: 180, w: 88, h: 106, artifactId: "artifact_016" }, // 낭공대사비 — 우측 상단
    ],
    labels: [],
    decorations: [],
  },
  prehistory: {
    id: "prehistory",
    name: "선사관",
    background: {
      key: "seonsaBg",
      path: "/maps/seonsa_bg.png",
      width: 1057,
      height: 452,
    },
    cameraZoom: 1.65,
    theme: { floor: 0xe5eee5, wall: 0x3f4b42, portal: 0x5f7fbd, artifact: 0xc9a24b },
    map: buildPrehistory(),
    start: { row: 2, col: 15 },
    startPx: { x: 545, y: 390 },
    collisions: [
      // 외벽과 큰 내부 벽
      { x: 0, y: 0, w: 1057, h: 18 },
      { x: 0, y: 424, w: 490, h: 28 },
      { x: 598, y: 424, w: 459, h: 28 },
      { x: 0, y: 0, w: 16, h: 170 },
      { x: 0, y: 244, w: 16, h: 208 },
      { x: 1040, y: 0, w: 17, h: 452 },
      { x: 168, y: 122, w: 176, h: 28 },
      { x: 344, y: 122, w: 28, h: 126 },
      { x: 218, y: 286, w: 166, h: 30 },
      { x: 88, y: 314, w: 70, h: 85 },
      { x: 520, y: 128, w: 18, h: 290 },
      { x: 706, y: 206, w: 18, h: 172 },
      { x: 885, y: 250, w: 155, h: 24 },
      // 전시대와 유물 받침대
      { x: 70, y: 22, w: 90, h: 38 },
      { x: 260, y: 24, w: 205, h: 50 },
      { x: 548, y: 52, w: 150, h: 45 },
      { x: 748, y: 102, w: 108, h: 28 },
      { x: 908, y: 32, w: 125, h: 42 },
      { x: 82, y: 205, w: 42, h: 65 },
      { x: 170, y: 214, w: 128, h: 52 },
      { x: 395, y: 168, w: 95, h: 45 },
      { x: 420, y: 330, w: 50, h: 70 },
      { x: 610, y: 203, w: 70, h: 108 },
      { x: 756, y: 196, w: 98, h: 46 },
      { x: 742, y: 334, w: 70, h: 24 },
      { x: 834, y: 302, w: 58, h: 58 },
      { x: 976, y: 122, w: 55, h: 92 },
    ],
    portalAreas: [
      { x: 495, y: 405, w: 100, h: 47, target: "lobby", spawn: { x: 730, y: 1270 }, label: "중앙홀" },
      { x: 0, y: 174, w: 62, h: 62, target: "ancient", spawn: { x: 760, y: 325 }, label: "고대관" },
    ],
    portals: {
      "2,15": { target: "lobby", spawn: { row: 21, col: 11 }, label: "중앙홀" },
    },
    artifacts: {},
    artifactAreas: [
      { x: 72, y: 72, w: 72, h: 58, artifactId: "artifact_001" },
      { x: 142, y: 204, w: 70, h: 66, artifactId: "artifact_002" },
      { x: 392, y: 164, w: 100, h: 48, artifactId: "artifact_003" },
      { x: 420, y: 328, w: 55, h: 72, artifactId: "artifact_036" },
      { x: 608, y: 202, w: 78, h: 112, artifactId: "artifact_034" },
      { x: 758, y: 194, w: 100, h: 54, artifactId: "artifact_032" },
      { x: 832, y: 300, w: 62, h: 62, artifactId: "artifact_031" },
      { x: 973, y: 118, w: 62, h: 100, artifactId: "artifact_033" },
    ],
    labels: [],
    decorations: [],
  },
  ancient: {
    id: "ancient",
    name: "고대관",
    background: {
      key: "godaeBg",
      path: "/maps/godae_bg.png",
      width: 873,
      height: 564,
    },
    theme: { floor: 0xe6ecef, wall: 0x3d464d, portal: 0x5f7fbd, artifact: 0xc9a24b },
    map: buildAncient(),
    start: { row: 3, col: 17 },
    startPx: { x: 812, y: 245 },
    collisions: [
      { x: 0, y: 0, w: 873, h: 5 },
      { x: 0, y: 0, w: 18, h: 370 },
      { x: 854, y: 84, w: 19, h: 455 },
      { x: 0, y: 539, w: 873, h: 25 },
      { x: 18, y: 80, w: 372, h: 20 },
      { x: 390, y: 0, w: 37, h: 365 },
      { x: 427, y: 0, w: 446, h: 86 },
      { x: 104, y: 365, w: 280, h: 53 },
      { x: 180, y: 418, w: 190, h: 121 },
      { x: 518, y: 214, w: 135, h: 30 },
      { x: 512, y: 258, w: 18, h: 205 },
      { x: 666, y: 184, w: 18, h: 282 },
      { x: 525, y: 450, w: 329, h: 30 },
    ],
    portalAreas: [
      { x: 815, y: 155, w: 58, h: 150, target: "prehistory", spawn: { x: 92, y: 285 }, label: "선사관" },
      { x: 840, y: 90,  w: 33, h: 370, target: "lobby",      spawn: { x: 2040, y: 1280 }, label: "중앙홀" },
    ],
    portals: {
      "3,17": { target: "lobby", spawn: { row: 21, col: 24 }, label: "중앙홀" },
    },
    artifacts: {
      "9,10":  "artifact_006",
      "14,16": "artifact_007",
      "10,26": "artifact_005",
      "18,25": "artifact_008",
    },
    artifactAreas: [
      { x: 20, y: 90, w: 80, h: 100, artifactId: "artifact_004" },
      { x: 125, y: 90, w: 100, h: 90, artifactId: "artifact_006" },
      { x: 215, y: 215, w: 100, h: 100, artifactId: "artifact_007" },
      { x: 125, y: 265, w: 100, h: 80, artifactId: "artifact_005" },
      { x: 445, y: 85, w: 60, h: 125, artifactId: "artifact_022" },
      { x: 690, y: 85, w: 110, h: 160, artifactId: "artifact_008" },
    ],
    labels: [
      { row: 9, col: 10, text: "백제" },
      { row: 14, col: 16, text: "가야" },
      { row: 10, col: 26, text: "신라" },
      { row: 18, col: 25, text: "금관" },
      { row: 4, col: 17, text: "중앙홀" },
    ],
    decorations: [
      { type: "plant", row: 7, col: 6 },
      { type: "plant", row: 19, col: 28 },
      { type: "column", row: 6, col: 20 },
      { type: "column", row: 14, col: 22 },
      { type: "bench", row: 19, col: 8 },
      { type: "bench", row: 16, col: 21 },
      { type: "spotlight", row: 6, col: 12 },
      { type: "spotlight", row: 7, col: 27 },
      { type: "spotlight", row: 15, col: 26 },
    ],
  },
};

// DEV 에디터가 저장한 오버라이드 적용 (mapOverrides.json)
Object.entries(overrides).forEach(([key, ov]) => {
  if (!MAPS[key]) return;
  if (ov.portalAreas?.length)       MAPS[key].portalAreas   = ov.portalAreas;
  if (ov.artifactAreas?.length)     MAPS[key].artifactAreas = ov.artifactAreas;
  if (Array.isArray(ov.collisions)) MAPS[key].collisions    = ov.collisions;
});
