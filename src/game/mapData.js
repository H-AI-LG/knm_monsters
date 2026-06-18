// ============================================================
// 국립중앙박물관 1층 프로토타입 맵
// 0 = 바닥, 1 = 벽/전시대, 2 = 유물 지점, 3 = 관 입구/출구
//
// 전체 1층을 하나의 축소 맵으로 우겨 넣지 않고,
// 중앙홀 허브에서 각 관 입구를 밟으면 해당 관 내부 맵으로 전환합니다.
// ============================================================
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
      width: 1672,
      height: 941,
    },
    theme: { floor: 0xeee7d8, wall: 0x4b463d, portal: 0x5f7fbd, artifact: 0xc9a24b },
    map: buildLobby(),
    start: START_TILE,
    startPx: { x: 260, y: 520 },
    collisions: [
      { x: 0, y: 0, w: 1672, h: 46 },
      { x: 0, y: 0, w: 12, h: 941 },
      { x: 1660, y: 0, w: 12, h: 941 },
      { x: 0, y: 885, w: 720, h: 56 },
      { x: 940, y: 885, w: 732, h: 56 },
      { x: 716, y: 315, w: 235, h: 270 },
      { x: 1285, y: 178, w: 150, h: 405 },
      { x: 655, y: 142, w: 385, h: 58 },
      { x: 645, y: 344, w: 55, h: 65 },
      { x: 978, y: 344, w: 55, h: 65 },
    ],
    portalAreas: [
      { x: 82, y: 190, w: 135, h: 135, target: "medieval", spawn: { row: 14, col: 20 }, label: "대한제국" },
      { x: 340, y: 190, w: 135, h: 135, target: "medieval", spawn: { row: 14, col: 20 }, label: "조선" },
      { x: 1225, y: 190, w: 135, h: 135, target: "medieval", spawn: { row: 14, col: 20 }, label: "고려" },
      { x: 1510, y: 250, w: 120, h: 135, target: "medieval", spawn: { row: 14, col: 20 }, label: "통일신라" },
      { x: 82, y: 665, w: 120, h: 130, target: "prehistory", spawn: { x: 540, y: 560 }, label: "구석기" },
      { x: 282, y: 665, w: 170, h: 130, target: "prehistory", spawn: { x: 540, y: 560 }, label: "청동기 고조선" },
      { x: 500, y: 665, w: 140, h: 130, target: "prehistory", spawn: { x: 540, y: 560 }, label: "부여 삼한" },
      { x: 1090, y: 665, w: 150, h: 130, target: "ancient", spawn: { row: 3, col: 17 }, label: "백제" },
      { x: 1300, y: 665, w: 135, h: 130, target: "ancient", spawn: { row: 3, col: 17 }, label: "가야" },
      { x: 1510, y: 665, w: 135, h: 130, target: "ancient", spawn: { row: 3, col: 17 }, label: "신라" },
    ],
    portals: {
      "5,18": { target: "medieval", spawn: { row: 14, col: 20 }, label: "중근세관" },
      "22,11": { target: "prehistory", spawn: { row: 2, col: 15 }, label: "선사관" },
      "22,24": { target: "ancient", spawn: { row: 3, col: 17 }, label: "고대관" },
    },
    artifacts: {},
    labels: [
      { row: 16, col: 4, text: "입구" },
      { row: 15, col: 18, text: "중앙홀" },
      { row: 6, col: 18, text: "중근세관" },
      { row: 23, col: 11, text: "선사관" },
      { row: 23, col: 24, text: "고대관" },
    ],
    decorations: [
      { type: "column", row: 12, col: 9 },
      { type: "column", row: 12, col: 23 },
      { type: "plant", row: 18, col: 8 },
      { type: "plant", row: 18, col: 23 },
      { type: "bench", row: 17, col: 13 },
      { type: "bench", row: 17, col: 20 },
      { type: "spotlight", row: 10, col: 13 },
      { type: "spotlight", row: 10, col: 22 },
    ],
  },
  medieval: {
    id: "medieval",
    name: "중근세관",
    theme: { floor: 0xf1dfd7, wall: 0x493f39, portal: 0x5f7fbd, artifact: 0xc9a24b },
    map: buildMedieval(),
    start: { row: 14, col: 20 },
    portals: {
      "14,20": { target: "lobby", spawn: { row: 6, col: 18 }, label: "중앙홀" },
    },
    artifacts: {
      "9,5": "대한제국실",
      "8,14": "조선실",
      "8,22": "고려실",
      "8,32": "통일신라실",
    },
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
  prehistory: {
    id: "prehistory",
    name: "선사관",
    background: {
      key: "seonsaBg",
      path: "/maps/seonsa_bg.png",
      width: 1081,
      height: 613,
    },
    theme: { floor: 0xe5eee5, wall: 0x3f4b42, portal: 0x5f7fbd, artifact: 0xc9a24b },
    map: buildPrehistory(),
    start: { row: 2, col: 15 },
    startPx: { x: 540, y: 560 },
    collisions: [
      { x: 0, y: 0, w: 1081, h: 18 },
      { x: 0, y: 0, w: 58, h: 613 },
      { x: 1056, y: 0, w: 25, h: 613 },
      { x: 58, y: 553, w: 292, h: 60 },
      { x: 620, y: 553, w: 436, h: 60 },
      { x: 63, y: 221, w: 366, h: 43 },
      { x: 484, y: 0, w: 24, h: 250 },
      { x: 797, y: 25, w: 18, h: 232 },
      { x: 593, y: 257, w: 292, h: 43 },
      { x: 916, y: 257, w: 140, h: 43 },
      { x: 426, y: 454, w: 43, h: 95 },
      { x: 641, y: 385, w: 34, h: 100 },
      { x: 783, y: 451, w: 95, h: 44 },
      { x: 862, y: 506, w: 102, h: 44 },
      { x: 523, y: 285, w: 72, h: 132 },
      { x: 190, y: 61, w: 205, h: 70 },
      { x: 105, y: 275, w: 103, h: 82 },
      { x: 225, y: 388, w: 230, h: 65 },
      { x: 751, y: 356, w: 182, h: 92 },
    ],
    portalAreas: [
      { x: 460, y: 548, w: 150, h: 65, target: "lobby", spawn: { x: 390, y: 780 }, label: "중앙홀" },
      { x: 0, y: 226, w: 74, h: 112, target: "ancient", spawn: { x: 812, y: 245 }, label: "고대관" },
    ],
    portals: {
      "2,15": { target: "lobby", spawn: { row: 21, col: 11 }, label: "중앙홀" },
    },
    artifacts: {
      "7,6": "구석기실",
      "12,12": "신석기실",
      "15,22": "농경문 청동기",
    },
    labels: [
      { row: 7, col: 6, text: "구석기" },
      { row: 12, col: 12, text: "신석기" },
      { row: 15, col: 22, text: "청동기" },
      { row: 3, col: 15, text: "중앙홀" },
    ],
    decorations: [
      { type: "plant", row: 5, col: 4 },
      { type: "plant", row: 17, col: 25 },
      { type: "bench", row: 14, col: 8 },
      { type: "bench", row: 18, col: 19 },
      { type: "spotlight", row: 4, col: 11 },
      { type: "spotlight", row: 6, col: 22 },
      { type: "column", row: 11, col: 6 },
    ],
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
      { x: 462, y: 205, w: 14, h: 174 },
    ],
    portalAreas: [
      { x: 815, y: 155, w: 58, h: 150, target: "prehistory", spawn: { x: 92, y: 285 }, label: "선사관" },
    ],
    portals: {
      "3,17": { target: "lobby", spawn: { row: 21, col: 24 }, label: "중앙홀" },
    },
    artifacts: {
      "9,10": "백제금동대향로",
      "14,16": "가야실",
      "10,26": "신라토기",
      "18,25": "금관",
    },
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
