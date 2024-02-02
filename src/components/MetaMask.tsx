async function getWeb3() {
  const ethereum = (window as any).ethereum;
  if (ethereum) {
    return ethereum;
  }
  return null;
}

async function getAccount(web3: any) {
  if (web3) {
    const users = await web3.request({ method: "eth_requestAccounts" });
    return users[0];
  }
  return null;
}

async function getPublicKey(web3: any, account: string) {
  if (web3) {
    const pubKey = await web3.request({
      method: "eth_getEncryptionPublicKey",
      params: [account],
    });
    return pubKey;
  }
  return null;
}

async function switchChain(web3: any) {
  if (web3) {
    await web3.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }], // Sepolia Testnet
    });
  }
}

export { getWeb3, getAccount, getPublicKey, switchChain };
