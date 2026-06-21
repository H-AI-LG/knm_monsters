import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// dev 모드 전용: 드래그 에디터 좌표를 dev_coords.json 파일로 저장
const devCoordsSaver = {
  name: "dev-coords-saver",
  configureServer(server) {
    server.middlewares.use("/__dev/save", (req, res) => {
      if (req.method !== "POST") { res.statusCode = 405; res.end(); return; }
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        const outPath = path.resolve(process.cwd(), "dev_coords.json");
        fs.writeFileSync(outPath, body, "utf8");
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, path: outPath }));
      });
    });
  },
};

// server.host: true → 같은 와이파이의 폰에서 'Network' 주소로 접속해 테스트 가능
export default defineConfig({
  plugins: [react(), devCoordsSaver],
  server: { host: true },
});
