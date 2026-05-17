// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { setAuthToken } from "./services/api";

// Set axios auth header before any component mounts so the first API
// call on page refresh goes out with the token already attached.
const savedToken = localStorage.getItem("token");
if (savedToken) setAuthToken(savedToken);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {" "}
        {/* <-- Wrap App */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
