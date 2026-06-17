import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// server.host: true → 같은 와이파이의 폰에서 'Network' 주소로 접속해 테스트 가능
export default defineConfig({
  plugins: [react()],
  server: { host: true },
});
