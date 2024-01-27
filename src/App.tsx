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
import * as sigUtil from "@metamask/eth-sig-util";
import * as ethUtil from "ethereumjs-util";

function App() {
  const queryParameters = new URLSearchParams(window.location.search);
  const to = (queryParameters.get("to") || "").toString().toLowerCase();
  const [waku, setWaku] = useState<LightNode>();
  const [status, setStatus] = useState<string>("Connecting...");
  const [messageComp, setMessageComp] = useState<any>();
  const [userLink, setUserLink] = useState("");
  const [txt, setTxt] = useState("");
  const [cipTxt, setCipTxt] = useState("");
  const [decTxt, setDecTxt] = useState("");

  useEffect(() => {
    const setuser = async () => {
      const u = (await initMetamask()).toLowerCase();
      const link = "/?to=" + u;
      setUserLink(link);
    };
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
  (window as any).ethereum.on("accountsChanged", () => {
    window.location.reload();
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>WhisUp3</h1>
        <h2>{status}</h2>
        <h3>
          Link:{" "}
          <a href={userLink} target="_blank">
            Click
          </a>
        </h3>
        <SenderForm to={to} waku={waku} onClickSend={sendMessage} />
        <button
          onClick={async () =>
            setMessageComp(await getStoredMessagesComponent(waku!))
          }
        >
          Get Messages
        </button>
        <ul>{messageComp}</ul>
        <input type="text" id="message" onChange={(e) => setTxt(e.target.value)}/>
        <button onClick={async () => setCipTxt(await test_eth(txt))}>Encrypt</button>
        <input type="text" id="cipher" value={cipTxt}/>
        <button onClick={async () => setDecTxt(await test_eth2(cipTxt))}>Decrypt</button>
        <input type="text" id="decrypted" value={decTxt}/>
      </header>
    </div>
  );
}

export default App;

const getStoredMessagesComponent = async (waku: LightNode) => {
  const user = (await initMetamask()).toLowerCase();
  const messagePairs = await getStoredMessage(waku, user!);
  const listItems = messagePairs.map((message) => <li>{message.message}</li>);
  return listItems;
};

const test_eth = async (message: string) => {
  const account = (await initMetamask()).toLowerCase();
  const web3 = (window as any).ethereum;
  const pubKey = await web3.request({
    method: "eth_getEncryptionPublicKey",
    params: [account],
  });
  // const pubKey = "Qas1GGGTn6KDwA8BNOyILNT0RQbdUwmVTaJ+jW5eZ38=";
  console.log(pubKey);
  const encrypted = encrypt(pubKey, message);
  return encrypted;
};

const test_eth2 = async (cipher: string) => {
  const account = (await initMetamask()).toLowerCase();
  const web3 = (window as any).ethereum;
  const decrypted = await decrypt(web3, account, cipher);
  return decrypted;
}

const encrypt = (publicKey: string, text: string) => {
  window.Buffer = Buffer;
  const result = sigUtil.encrypt({
    publicKey,
    data: text,
    version: "x25519-xsalsa20-poly1305",
  });
  
  return ethUtil.bufferToHex(Buffer.from(JSON.stringify(result), "utf8"));
};

const decrypt = async (web3: any, account: string, text: string) => {
  const result = await web3.request({
    method: "eth_decrypt",
    params: [text, account],
  });

  return result;
};
