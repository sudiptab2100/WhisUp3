import { useEffect, useState } from "react";
import "./App.css";
import {
  initWaku,
  sendMessage,
  getStoredMessage
} from "./components/Waku";
import { LightNode } from "@waku/sdk";
import SenderForm from "./components/SenderForm";
import { getWeb3, getAccount, getPublicKey, switchChain } from "./components/MetaMask";
import { encryptEC, decryptEC } from "./components/Crypt";
import { getWeb3Chain, getContract, setPubKeyChain, getPubKeyChain } from "./components/Web3Chain";

function App() {
  const queryParameters = new URLSearchParams(window.location.search);
  const to = (queryParameters.get("to") || "").toString().toLowerCase();
  const [waku, setWaku] = useState<LightNode>();
  const [web3, setWeb3] = useState<any>();
  const [pubKey, setPubKey] = useState<string>("");
  const [status, setStatus] = useState<string>("Connecting...");
  const [messageComp, setMessageComp] = useState<any>();
  const [userLink, setUserLink] = useState("");
  const [txt, setTxt] = useState("");
  const [cipTxt, setCipTxt] = useState("");
  const [decTxt, setDecTxt] = useState("");

  useEffect(() => {
    const setuser = async () => {
      const w3 = await getWeb3();
      setWeb3(w3);
      const u = (await getAccount(w3)).toLowerCase();
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
        <button
          onClick={async () =>
            setPubKey(await getPublicKey(web3, userLink.substring(5)))
          }
        >
          Set Public Key
        </button>
        <input
          type="text"
          id="message"
          onChange={(e) => setTxt(e.target.value)}
        />
        <button onClick={async () => setCipTxt(await encryptEC(pubKey, txt))}>
          Encrypt
        </button>
        <input type="text" id="cipher" value={cipTxt} />
        <button
          onClick={async () =>
            setDecTxt(await decryptEC(web3, userLink.substring(5), cipTxt))
          }
        >
          Decrypt
        </button>
        <input type="text" id="decrypted" value={decTxt} />
      </header>
    </div>
  );
}

export default App;

const getStoredMessagesComponent = async (waku: LightNode) => {
  const w3 = await getWeb3();
  await switchChain(w3);
  const w3Chain = await getWeb3Chain(w3);
  const contract = await getContract(
    w3Chain,
    "0xf44f4a08786BDD99A30b1765467f41b32650A6A4"
  ); console.log(contract);
  const user = (await getAccount(w3)).toLowerCase();
  const pk = await getPubKeyChain(contract, user);
  console.log(pk);
  if(pk! === "") 
    await setPubKeyChain(contract, user, await getPublicKey(w3, user));
  const messagePairs = await getStoredMessage(waku, user!);
  const listItems = messagePairs.map((message) => <li>{message.message}</li>);
  return listItems;
};