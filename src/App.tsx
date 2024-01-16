import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { initWaku, SendMessage } from "./components/Waku";
import { LightNode } from "@waku/sdk";
import SenderForm from "./components/SenderForm";

function App() {
  const queryParameters = new URLSearchParams(window.location.search);
  const user = queryParameters.get("user")?.toString();
  console.log(user);
  const [waku, setWaku] = useState<LightNode>();
  useEffect(() => {
    const init = async () => {
      const node = await initWaku(user || "");
      setWaku(node);
    };
    init();
  });
    
  return (
    <div className="App">
      <header className="App-header">
        <SenderForm user={user || ""} waku={waku} onClickSend={SendMessage} />
      </header>
    </div>
  );
}

export default App;
