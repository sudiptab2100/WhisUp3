import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  initWaku,
  sendMessage,
  getStoredMessage,
  initMetamask,
  MessagePair,
} from "./components/Waku";
import { LightNode } from "@waku/sdk";
import SenderForm from "./components/SenderForm";

function App() {
  const queryParameters = new URLSearchParams(window.location.search);
  const to = (queryParameters.get("to") || "").toString();
  console.log(to);
  const [waku, setWaku] = useState<LightNode>();
  const [status, setStatus] = useState<string>("Connecting...");
  useEffect(() => {
    const init = async () => {
      const node = await initWaku();
      setWaku(node);
      if (waku?.isConnected()) setStatus("Connected");
    };
    init();
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>Waku Chat</h1>
        <h2>{status}</h2>
        <SenderForm to={to} waku={waku} onClickSend={sendMessage} />
        <button onClick={() => getStoredMessages(waku!)}>Get Messages</button>
      </header>
    </div>
  );
}

export default App;

const getStoredMessages = async (waku: LightNode) => {
  const user = await initMetamask();
  console.log(user);
  const messagePairs = await getStoredMessage(waku, user!);
  console.log(messagePairs);
};
