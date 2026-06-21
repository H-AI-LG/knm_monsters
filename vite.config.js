import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// dev 모드 전용: 드래그 에디터 좌표를 mapOverrides.json에 병합 저장
const OVERRIDES_PATH = path.resolve(process.cwd(), "src/data/mapOverrides.json");

const devCoordsSaver = {
  name: "dev-coords-saver",
  configureServer(server) {
    server.middlewares.use("/__dev/save", (req, res) => {
      if (req.method !== "POST") { res.statusCode = 405; res.end(); return; }
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const incoming = JSON.parse(body); // { mapKey, portalAreas, artifactAreas }
          let existing = {};
          try { existing = JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8")); } catch {}
          existing[incoming.mapKey] = {
            portalAreas:   incoming.portalAreas,
            artifactAreas: incoming.artifactAreas,
          };
          fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(existing, null, 2), "utf8");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: String(e) }));
        }
      });
    });
  },
};

// server.host: true → 같은 와이파이의 폰에서 'Network' 주소로 접속해 테스트 가능
export default defineConfig({
  plugins: [react(), devCoordsSaver],
  server: {
    host: true,
    // mapOverrides.json은 에디터가 직접 관리 — Vite HMR 감시 제외
    watch: { ignored: ["**/src/data/mapOverrides.json"] },
  },
});
