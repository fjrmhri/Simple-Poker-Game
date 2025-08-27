// src/index.js

import React from "react";
import ReactDOM from "react-dom/client";
import AppDebug from "./AppDebug";
import "./index.css"; // Tailwind styles

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppDebug />
  </React.StrictMode>
);
