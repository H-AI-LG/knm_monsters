import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// 주의: StrictMode를 쓰면 개발 모드에서 Phaser 게임이 두 번 생성될 수 있어
// 일부러 빼뒀습니다. (배포에는 영향 없음)
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
