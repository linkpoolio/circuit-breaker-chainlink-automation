import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export const getContract = (contractAddress: string, contractAbi: any) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractAbi, signer);
};


export function convertFunctionNametoSignature(name: string): string {
  const buffer = Buffer.from(name);
  const hexStr = ethers.utils.keccak256(`0x${buffer.toString("hex")}`);
  return hexStr.slice(0, 10);
}
