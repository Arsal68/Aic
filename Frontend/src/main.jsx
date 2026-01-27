import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Keep this if you are using Tailwind/CSS

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);