import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./Features/store/store";
import { ChatProvider } from "./Redux/ChatContext"; // ✅ correct
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ChatProvider>     {/* ✅ wrap */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChatProvider>
    </Provider>
  </React.StrictMode>
);
