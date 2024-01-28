import * as sigUtil from "@metamask/eth-sig-util";
import * as ethUtil from "ethereumjs-util";
import { Buffer } from "buffer";

const encryptEC = (publicKey: string, text: string) => {
  window.Buffer = Buffer;
  const result = sigUtil.encrypt({
    publicKey,
    data: text,
    version: "x25519-xsalsa20-poly1305",
  });

  return ethUtil.bufferToHex(Buffer.from(JSON.stringify(result), "utf8"));
};

const decryptEC = async (web3: any, account: string, text: string) => {
  const result = await web3.request({
    method: "eth_decrypt",
    params: [text, account],
  });

  return result;
};

export { encryptEC, decryptEC };
