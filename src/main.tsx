import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Providers } from "./components/providers/Providers.tsx";

// 개발 모드 또는 환경 변수로 활성화된 경우 더미 데이터 생성 유틸리티 등록
const isDummyGeneratorEnabled =
  import.meta.env.DEV ||
  import.meta.env.MODE === "development" ||
  import.meta.env.VITE_ENABLE_DUMMY_GENERATOR === "true";

if (isDummyGeneratorEnabled) {
  import("./lib/generate-dummy-keys");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);
