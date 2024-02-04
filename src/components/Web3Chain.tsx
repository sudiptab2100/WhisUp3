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

export { getWeb3Chain, getContract };