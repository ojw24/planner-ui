/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

const originalWarn = console.warn;
console.warn = (message, ...args) => {
  // flushSync 관련 경고 메시지만 필터링하여 무시
  if (message.includes("flushSync") || message.includes("React does not recognize the")) {
    return; // 경고 무시
  } else {
    originalWarn(message, ...args); // 다른 경고는 그대로 출력
  }
};

const originalError = console.error;
console.error = (message, ...args) => {
  if (message.includes("flushSync") || message.includes("React does not recognize the")) {
    return; // 해당 오류 메시지 무시
  } else {
    originalError(message, ...args); // 그 외 오류 출력
  }
};

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";
import "./index.css";

// Material Dashboard 2 React Context Provider
import { MaterialUIControllerProvider } from "context";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <MaterialUIControllerProvider>
      <App />
    </MaterialUIControllerProvider>
  </BrowserRouter>
);
