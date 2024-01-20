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
  const to = (queryParameters.get("to") || "").toString().toLowerCase();
  const [waku, setWaku] = useState<LightNode>();
  const [status, setStatus] = useState<string>("Connecting...");
  const [messageComp, setMessageComp] = useState<any>();
  const [userLink, setUserLink] = useState("");

  useEffect(() => {
    const setuser = async () => {
      const u = (await initMetamask()).toLowerCase();
      const link = "/?to=" + u;
      setUserLink(link);
    }
    setuser();
  });

  useEffect(() => {
    const init = async () => {
      const node = await initWaku();
      if (node) {
        setWaku(node);
        setStatus("Connected");
      }
    };
    init();
  });

  // Account change reload
  (window as any).ethereum.on('accountsChanged', () => {
    window.location.reload();
  })

  return (
    <div className="App">
      <header className="App-header">
        <h1>WhisUp3</h1>
        <h2>{status}</h2>
        <h3>Link: <a href={userLink} target="_blank">Click</a></h3>
        <SenderForm to={to} waku={waku} onClickSend={sendMessage} />
        <button onClick={async () => setMessageComp(await getStoredMessagesComponent(waku!))}>Get Messages</button>
        <ul>{messageComp}</ul>
      </header>
    </div>
  );
}

export default App;

const getStoredMessagesComponent = async (waku: LightNode) => {
  const user = (await initMetamask()).toLowerCase();
  const messagePairs = await getStoredMessage(waku, user!);
  const listItems = messagePairs.map(message => <li>{message.message}</li>);
  return listItems;
};
