import { useEffect, useState } from "react";
import "./App.css";
import { initWaku, sendMessage, getStoredMessage } from "./components/Waku";
import { LightNode } from "@waku/sdk";
import SenderForm from "./components/SenderForm";
import {
  getWeb3,
  getAccount,
  getPublicKey,
  switchChain,
} from "./components/MetaMask";
import { encryptEC, decryptEC } from "./components/Crypt";
import {
  getWeb3Chain,
  getContract,
  setPubKeyChain,
  getPubKeyChain,
} from "./components/Web3Chain";

function App() {
  const queryParameters = new URLSearchParams(window.location.search);
  const to = (queryParameters.get("to") || "").toString().toLowerCase();
  const [waku, setWaku] = useState<LightNode>();
  const [web3, setWeb3] = useState<any>();
  const [web3Chain, setWeb3Chain] = useState<any>();
  const [pubKey, setPubKey] = useState<string>("");
  const [toPubKey, setToPubKey] = useState<string>("");
  const [status, setStatus] = useState<string>("Connecting...");
  const [messageComp, setMessageComp] = useState<any>();
  const [userLink, setUserLink] = useState("");

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

  const contractAddress = "0xf44f4a08786BDD99A30b1765467f41b32650A6A4";

  return (
    <div className="App">
      <header className="App-header">
        <h1>WhisUp3</h1>
        <h2>{status}</h2>
        <button
          onClick={async () =>
            connectMetaMask(setWeb3, setUserLink, setWeb3Chain)
          }
        >
          Connect MetaMask
        </button>
        <h5>User: {userLink.slice(-42)} <a href={userLink} target="_blank">(Go!)</a></h5>
        <button
          onClick={async () =>
            setPubKey(await getPublicKey(web3, userLink.slice(-42)))
          }
        >
          Get Pub Enc Key From MetaMask
        </button>
        <button
          onClick={async () =>
            setPubKeyChain(
              await getContract(web3Chain, contractAddress),
              userLink.slice(-42),
              pubKey
            )
          }
        >
          Publish On-Chain
        </button>
        <button
          onClick={async () =>
            setToPubKey(
              await getPubKeyChain(
                await getContract(web3Chain, contractAddress),
                userLink.slice(-42)
              )
            )
          }
        >
          Get Pub Enc Key (On-Chain)
        </button>
        <h5>To Public Enc. Key: {toPubKey}</h5>
        <SenderForm to={to} waku={waku} onClickSend={sendMessageEnc} />
        <button
          onClick={async () =>
            setMessageComp(await getStoredMessagesComponent(waku!))
          }
        >
          Get Messages
        </button>
        <ul>{messageComp}</ul>
      </header>
    </div>
  );
}

export default App;

const connectMetaMask = async (
  setWeb3: React.Dispatch<any>,
  setUserLink: React.Dispatch<React.SetStateAction<string>>,
  setWeb3Chain: React.Dispatch<any>
) => {
  const w3 = await getWeb3();
  setWeb3(w3);
  await switchChain(w3);
  const u = (await getAccount(w3)).toLowerCase();
  const path = window.location.pathname;
  const link = path + "?to=" + u;
  setUserLink(link);
  const w3Chain = await getWeb3Chain(w3);
  setWeb3Chain(w3Chain);
};

const getStoredMessagesComponent = async (waku: LightNode) => {
  const w3 = await getWeb3();
  const user = (await getAccount(w3)).toLowerCase();
  const messagePairs = await getStoredMessage(waku, user!);
  const listItems = messagePairs.map((message, index) => (
    <li>
      <input
        type="textbox"
        id={"msg" + index.toString()}
        value={message.message}
      />
      <button onClick={async () => await decMsgBox("msg" + index.toString())}>
        Decrypt
      </button>
    </li>
  ));
  return listItems;
};

const sendMessageEnc = async (waku: LightNode, to: string, txt: string) => {
  const web3Chain = await getWeb3Chain(await getWeb3());
  const contractAddress = "0xf44f4a08786BDD99A30b1765467f41b32650A6A4";
  const toPubKey = await getPubKeyChain(
    await getContract(web3Chain, contractAddress),
    to
  );
  const cipTxt = await encryptEC(toPubKey, txt);
  const res = await sendMessage(waku, to, cipTxt);
  return res;
};

const decMsgBox = async (boxId: string) => {
  const w3 = await getWeb3();
  const user = (await getAccount(w3)).toLowerCase();
  const cipTxt = (document.getElementById(boxId) as HTMLInputElement).value;
  const decTxt = await decryptEC(w3, user, cipTxt);
  (document.getElementById(boxId) as HTMLInputElement).value = decTxt;
};
