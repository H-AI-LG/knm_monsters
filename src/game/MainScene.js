import Phaser from "phaser";
import { TILE, TILE_KIND, MAPS, START_MAP } from "./mapData";
import { joy, hooks } from "./input";

const tileCenter = ({ row, col }) => ({
  x: (col + 0.5) * TILE,
  y: (row + 0.5) * TILE,
});

const pointInRect = (x, y, rect) =>
  x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;

const scaleRect = (rect, scale) => ({
  ...rect,
  x: rect.x * scale,
  y: rect.y * scale,
  w: rect.w * scale,
  h: rect.h * scale,
});

export default class MainScene extends Phaser.Scene {
  preload() {
    Object.values(MAPS).forEach((map) => {
      if (map.background) this.load.image(map.background.key, map.background.path);
    });

    // [수정] 0번부터 11번까지의 낱개 프레임 이미지를 개별 로드합니다.
    // public/sprites/wch_frames/frame_00.png ~ frame_11.png 포맷 기준
    for (let i = 0; i <= 11; i++) {
      // 한 자릿수 숫자는 앞에 0을 붙여 파일명 매칭 (예: 0 -> "00", 11 -> "11")
      const frameNum = String(i).padStart(2, '0');
      this.load.image(`wch_${i}`, `/sprites/wch_frames/frame_${frameNum}.png`);
    }
  }

  create() {
    this.mapLayer = this.add.group();
    this.walls = this.physics.add.staticGroup();
    this.currentMapKey = START_MAP;
    this.currentArtifact = null;
    this.portalCooldownUntil = 0;
    this.canUsePortal = false;

    this.loadMap(this.currentMapKey);
    this.createPlayerAnimations();

    const start = this.getSpawnPoint(this.currentMap.startPx || this.currentMap.start);
    
    // 기본 정면 멈춤 상태인 'wch_0' 이미지로 캐릭터 생성
    // 쪼개진 이미지 크기에 맞춰 스케일 조절 (적절히 조절 가능)
    this.player = this.add
      .sprite(start.x, start.y, "wch_0")
      .setScale(0.2) 
      .setDepth(20);
      
    this.physics.add.existing(this.player);

    // 캐릭터 실제 렌더링 크기에 맞춰 충돌 박스를 정중앙 근처로 세팅
    // 낱개 프레임의 크기에 맞게 내부 픽셀 사이즈를 살짝 다듬었습니다.
    const displayW = this.player.width;
    const displayH = this.player.height;
    this.player.body.setSize(displayW * 0.25, displayH * 0.15);
    this.player.body.setOffset(displayW * 0.375, displayH * 0.8); 
    
    this.player.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);

    this.setCameraBounds();
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.facing = "down";
    hooks.onMapChange?.(this.currentMap.name);
  }

  createPlayerAnimations() {
    if (this.anims.exists("walk-down")) return;

    // 1. 앞모습 애니메이션 (0, 1, 2)
    this.anims.create({
      key: "walk-down",
      frames: [
        { key: "wch_0" }, { key: "wch_1" }, { key: "wch_2" }
      ],
      frameRate: 8,
      repeat: -1,
    });
    
    // 2. 왼쪽 옆모습 애니메이션 (3, 4, 5)
    this.anims.create({
      key: "walk-left",
      frames: [
        { key: "wch_3" }, { key: "wch_4" }, { key: "wch_5" }
      ],
      frameRate: 8,
      repeat: -1,
    });

    // 3. 오른쪽 옆모습 애니메이션 (6, 7, 8)
    this.anims.create({
      key: "walk-right",
      frames: [
        { key: "wch_6" }, { key: "wch_7" }, { key: "wch_8" }
      ],
      frameRate: 8,
      repeat: -1,
    });
    
    // 4. 뒷모습 애니메이션 (9, 10, 11)
    this.anims.create({
      key: "walk-up",
      frames: [
        { key: "wch_9" }, { key: "wch_10" }, { key: "wch_11" }
      ],
      frameRate: 8,
      repeat: -1,
    });
  }

  loadMap(mapKey, spawnTile) {
    this.currentMapKey = mapKey;
    this.currentMap = MAPS[mapKey];
    this.currentArtifact = null;
    this.portalCooldownUntil = this.time.now + 450;
    this.canUsePortal = false;

    this.mapLayer.clear(true, true);
    this.walls.clear(true, true);

    const { map, theme } = this.currentMap;

    if (this.currentMap.background) {
      this.drawBackgroundMap();
    } else {
      this.drawTileMap(map, theme);
    }

    if (this.player && spawnTile) {
      const spawn = this.getSpawnPoint(spawnTile);
      this.player.body.setVelocity(0, 0);
      this.player.setPosition(spawn.x, spawn.y);
      this.setCameraBounds();
      hooks.onArtifact?.(null);
      hooks.onMapChange?.(this.currentMap.name);
    }
  }

  drawBackgroundMap() {
    const { background, collisions } = this.currentMap;
    const scale = this.getBackgroundScale();
    const bg = this.add.image(0, 0, background.key).setOrigin(0).setScale(scale).setDepth(0);
    this.mapLayer.add(bg);

    collisions?.forEach((rect) => {
      const scaled = scaleRect(rect, scale);
      const wall = this.add
        .rectangle(scaled.x + scaled.w / 2, scaled.y + scaled.h / 2, scaled.w, scaled.h, 0xff3355, 0)
        .setVisible(false);
      this.mapLayer.add(wall);
      this.walls.add(wall);
    });

    this.currentMap.artifactAreas?.forEach((area) => {
      const cx = (area.x + area.w / 2) * scale;
      const cy = (area.y + area.h / 2) * scale;
      this.drawArtifactBgMarker(cx, cy);
    });
  }

  drawArtifactBgMarker(cx, cy) {
    const color = this.currentMap.theme.artifact;
    const glow = this.add.circle(cx, cy, 18, color, 0.22).setDepth(12);
    const orb = this.add.circle(cx, cy, 10, color, 0.92).setStrokeStyle(2, 0x7b5a20).setDepth(13);
    const shine = this.add.rectangle(cx - 3, cy - 4, 3, 7, 0xffffff, 0.55).setDepth(14);
    this.mapLayer.addMultiple([glow, orb, shine]);
  }

  drawTileMap(map, theme) {
    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[r].length; c++) {
        const x = c * TILE;
        const y = r * TILE;
        const tile = map[r][c];

        if (tile === TILE_KIND.WALL) {
          const wall = this.drawWallTile(x, y, r, c, theme.wall);
          this.mapLayer.add(wall);
          this.walls.add(wall);
          continue;
        }

        const floor = this.drawFloorTile(x, y, r, c, theme.floor);
        this.mapLayer.add(floor);

        if (tile === TILE_KIND.PORTAL) {
          this.drawPortal(x, y, theme.portal);
        }

        if (tile === TILE_KIND.ARTIFACT) {
          this.drawArtifact(x, y, theme.artifact);
        }
      }
    }

    this.drawRoomTrim();
    this.currentMap.decorations?.forEach((decoration) => this.drawDecoration(decoration));

    this.currentMap.labels.forEach(({ row, col, text }) => {
      const label = this.add
        .text(col * TILE + TILE / 2, row * TILE + TILE / 2, text, {
          fontFamily: "-apple-system, Apple SD Gothic Neo, Noto Sans KR, sans-serif",
          fontSize: "12px",
          color: "#352f28",
          align: "center",
          backgroundColor: "rgba(239,230,208,0.82)",
          padding: { x: 5, y: 3 },
        })
        .setOrigin(0.5)
        .setAlpha(0.95)
        .setDepth(9);
      this.mapLayer.add(label);
    });
  }

  drawFloorTile(x, y, row, col, color) {
    const floor = this.add
      .rectangle(x, y, TILE, TILE, color)
      .setOrigin(0)
      .setStrokeStyle(1, 0xcfc8ba)
      .setDepth(0);
    const tileTint = this.add
      .rectangle(x, y, TILE, TILE, (row + col) % 2 === 0 ? 0xffffff : 0x6f6a60, (row + col) % 2 === 0 ? 0.08 : 0.04)
      .setOrigin(0)
      .setDepth(1);
    this.mapLayer.add(tileTint);

    if ((row * 7 + col * 3) % 19 === 0) {
      const shine = this.add.ellipse(x + TILE * 0.5, y + TILE * 0.35, TILE * 0.55, TILE * 0.16, 0xffffff, 0.16);
      this.mapLayer.add(shine);
    }

    return floor;
  }

  drawWallTile(x, y, row, col, color) {
    const wall = this.add.rectangle(x, y, TILE, TILE, color).setOrigin(0).setDepth(3);
    const top = this.add.rectangle(x, y, TILE, 5, 0x756f63, 0.55).setOrigin(0).setDepth(4);
    const grout = this.add.rectangle(x, y + TILE - 1, TILE, 1, 0x2f2c28, 0.45).setOrigin(0).setDepth(4);
    this.mapLayer.addMultiple([top, grout]);

    if ((row + col) % 2 === 0) {
      const brick = this.add.rectangle(x + 4, y + 17, TILE - 8, 2, 0x5d584f, 0.55).setOrigin(0).setDepth(4);
      this.mapLayer.add(brick);
    }

    return wall;
  }

  drawRoomTrim() {
    const { map } = this.currentMap;
    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[r].length; c++) {
        if (map[r][c] === TILE_KIND.WALL) continue;
        const x = c * TILE;
        const y = r * TILE;
        const edges = [
          [map[r - 1]?.[c], x, y, TILE, 3],
          [map[r + 1]?.[c], x, y + TILE - 3, TILE, 3],
          [map[r]?.[c - 1], x, y, 3, TILE],
          [map[r]?.[c + 1], x + TILE - 3, y, 3, TILE],
        ];
        edges.forEach(([neighbor, ex, ey, ew, eh]) => {
          if (neighbor === TILE_KIND.WALL || neighbor === undefined) {
            const trim = this.add.rectangle(ex, ey, ew, eh, 0x8b867b, 0.65).setOrigin(0).setDepth(5);
            this.mapLayer.add(trim);
          }
        });
      }
    }
  }

  drawPortal(x, y, color) {
    const portal = this.add
      .rectangle(x + TILE / 2, y + TILE / 2, TILE * 0.88, TILE * 0.78, 0x5c5150)
      .setStrokeStyle(2, color)
      .setDepth(7);
    const glow = this.add.circle(x + TILE / 2, y + TILE / 2, 14, color, 0.35).setDepth(6);
    const arrow = this.add.triangle(x + TILE / 2, y + TILE / 2 + 1, 0, 12, 16, -12, 32, 12, 0xffffff).setScale(0.62).setDepth(8);
    this.mapLayer.addMultiple([glow, portal, arrow]);
  }

  drawArtifact(x, y, color) {
    const shadow = this.add.ellipse(x + TILE / 2, y + TILE * 0.82, TILE * 0.82, 8, 0x000000, 0.18).setDepth(4);
    const base = this.add.rectangle(x + TILE / 2, y + TILE * 0.68, TILE * 0.72, TILE * 0.28, 0xb7aa91).setStrokeStyle(2, 0x726a5b).setDepth(5);
    const glass = this.add.rectangle(x + TILE / 2, y + TILE * 0.36, TILE * 0.68, TILE * 0.58, 0xaed8e8, 0.38).setStrokeStyle(2, 0xd6f1fb).setDepth(6);
    const relic = this.add.circle(x + TILE / 2, y + TILE * 0.52, 10, color).setStrokeStyle(2, 0x7b5a20).setDepth(7);
    const shine = this.add.rectangle(x + TILE * 0.36, y + TILE * 0.19, 3, TILE * 0.38, 0xffffff, 0.5).setDepth(8);
    this.mapLayer.addMultiple([shadow, base, glass, relic, shine]);
  }

  drawDecoration({ type, row, col }) {
    const x = col * TILE + TILE / 2;
    const y = row * TILE + TILE / 2;
    const parts = [];

    if (type === "plant") {
      parts.push(this.add.ellipse(x, y + 12, 22, 8, 0x000000, 0.16));
      parts.push(this.add.rectangle(x, y + 9, 18, 12, 0xb5a389).setStrokeStyle(1, 0x716552));
      parts.push(this.add.circle(x - 7, y - 2, 8, 0x4f8b57));
      parts.push(this.add.circle(x + 6, y - 4, 9, 0x3f7d4a));
      parts.push(this.add.circle(x, y - 11, 8, 0x65a866));
    }

    if (type === "column") {
      parts.push(this.add.ellipse(x, y + 13, 24, 8, 0x000000, 0.18));
      parts.push(this.add.rectangle(x, y, 16, 34, 0xc7beaa).setStrokeStyle(2, 0x81796b));
      parts.push(this.add.rectangle(x, y - 17, 24, 7, 0xd8cfbd).setStrokeStyle(1, 0x81796b));
      parts.push(this.add.rectangle(x, y + 17, 24, 7, 0xa89e8d).setStrokeStyle(1, 0x81796b));
    }

    if (type === "bench") {
      parts.push(this.add.ellipse(x, y + 9, 34, 7, 0x000000, 0.13));
      parts.push(this.add.rectangle(x, y, 34, 10, 0xb7aa91).setStrokeStyle(2, 0x756a58));
      parts.push(this.add.rectangle(x - 10, y + 8, 4, 9, 0x756a58));
      parts.push(this.add.rectangle(x + 10, y + 8, 4, 9, 0x756a58));
    }

    if (type === "spotlight") {
      parts.push(this.add.circle(x, y - 4, 5, 0xfff5b8).setStrokeStyle(1, 0x8b7a4f));
      parts.push(this.add.ellipse(x, y + 13, 30, 12, 0xfff3b0, 0.16));
    }

    parts.forEach((part) => {
      part.setDepth(10);
      this.mapLayer.add(part);
    });
  }

  setCameraBounds() {
    const scale = this.getBackgroundScale();
    const mapWidth = this.currentMap.background ? this.currentMap.background.width * scale : this.currentMap.map[0].length * TILE;
    const mapHeight = this.currentMap.background ? this.currentMap.background.height * scale : this.currentMap.map.length * TILE;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
  }

  getBackgroundScale() {
    return this.currentMap.background?.scale || 1;
  }

  getSpawnPoint(spawn) {
    if (spawn.x === undefined) return tileCenter(spawn);
    const scale = this.getBackgroundScale();
    return { x: spawn.x * scale, y: spawn.y * scale };
  }

  update() {
    const speed = 220;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown) vx = -1;
    else if (this.cursors.right.isDown) vx = 1;
    if (this.cursors.up.isDown) vy = -1;
    else if (this.cursors.down.isDown) vy = 1;

    if (joy.active) {
      vx = joy.x;
      vy = joy.y;
    }

    const len = Math.hypot(vx, vy);
    if (len > 1) {
      vx /= len;
      vy /= len;
    }
    this.player.body.setVelocity(vx * speed, vy * speed);
    this.updatePlayerAnimation(vx, vy);

    if (this.currentMap.portalAreas && this.time.now > this.portalCooldownUntil) {
      const scale = this.getBackgroundScale();
      const portal = this.currentMap.portalAreas.find((area) => pointInRect(this.player.x, this.player.y, scaleRect(area, scale)));
      if (!portal) this.canUsePortal = true;
      if (portal && this.canUsePortal) {
        this.loadMap(portal.target, portal.spawn);
        return;
      }
    }

    if (this.currentMap.background) {
      if (this.currentMap.artifactAreas) {
        const scale = this.getBackgroundScale();
        const artArea = this.currentMap.artifactAreas.find((area) =>
          pointInRect(this.player.x, this.player.y, scaleRect(area, scale))
        );
        const artifactId = artArea ? artArea.artifactId : null;
        if (artifactId !== this.currentArtifact) {
          this.currentArtifact = artifactId;
          hooks.onArtifact?.(artifactId);
        }
        if (this.currentArtifact && Phaser.Input.Keyboard.JustDown(this.aKey)) {
          hooks.onActivate?.();
        }
      } else if (this.currentArtifact) {
        this.currentArtifact = null;
        hooks.onArtifact?.(null);
      }
      return;
    }

    if (!this.currentMap.map) return;

    const col = Math.floor(this.player.x / TILE);
    const row = Math.floor(this.player.y / TILE);
    const key = row + "," + col;
    const tile = this.currentMap.map[row]?.[col];
    if (tile !== TILE_KIND.PORTAL) this.canUsePortal = true;
    if (tile === TILE_KIND.PORTAL && this.time.now > this.portalCooldownUntil) {
      const portal = this.currentMap.portals[key];
      if (portal && this.canUsePortal) this.loadMap(portal.target, portal.spawn);
      return;
    }

    const artifactId = tile === TILE_KIND.ARTIFACT ? this.currentMap.artifacts[key] || null : null;
    if (artifactId !== this.currentArtifact) {
      this.currentArtifact = artifactId;
      hooks.onArtifact?.(artifactId);
    }

    if (this.currentArtifact && Phaser.Input.Keyboard.JustDown(this.aKey)) {
      hooks.onActivate?.();
    }
  }

  updatePlayerAnimation(vx, vy) {
    const moving = Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1;

    // --- 1. 정지 모션 제어 (텍스처를 고정 이미지 키로 직접 변경) ---
    if (!moving) {
      this.player.anims.stop();
      if (this.facing === "up") this.player.setTexture("wch_9");
      else if (this.facing === "left") this.player.setTexture("wch_3");
      else if (this.facing === "right") this.player.setTexture("wch_6");
      else this.player.setTexture("wch_0");
      return;
    }

    // --- 2. 이동 애니메이션 제어 ---
    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx < 0) {
        this.facing = "left";
        this.player.anims.play("walk-left", true);
      } else {
        this.facing = "right";
        this.player.anims.play("walk-right", true);
      }
    } else {
      if (vy < 0) {
        this.facing = "up";
        this.player.anims.play("walk-up", true);
      } else {
        this.facing = "down";
        this.player.anims.play("walk-down", true);
      }
    }
  }
}