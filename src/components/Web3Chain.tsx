import { Web3 } from "web3";
import abi from "../smart_contract/abi.json";

async function getWeb3Chain(web3: any) {
  if (web3) {
    return new Web3(web3);
  }
  return null;
}

async function getContract(web3: any, contractAddress: string) {
  if (web3) {
    return new web3.eth.Contract(abi, contractAddress);
  }
  return null;
}

async function setPubKeyChain(contract: any, account: string, pubKey: string) {
  if (contract) {
    const result = await contract.methods.setPubKey(pubKey).send({ from: account });
    console.log(result);
  }
}

async function getPubKeyChain(contract: any, account: string) {
  if (contract) {
    const result = await contract.methods.getPubKey(account).call();
    return result;
  }
  return null;
}

export { getWeb3Chain, getContract, setPubKeyChain, getPubKeyChain};