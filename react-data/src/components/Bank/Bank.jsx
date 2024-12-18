import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import { Contract, ethers } from "ethers";
import { useState, useEffect, useRef } from 'react';
import bankManifest from "../../contracts/Bank.json";


function Bank() {
  const bank = useRef(null);


  useEffect(() => {
    initContracts();
  }, [])

  let initContracts = async () => {
    await getBlockchain();
  }

  let getBlockchain = async () => {
    let provider = await detectEthereumProvider();
    if (provider) {
      await provider.request({ method: 'eth_requestAccounts' });
      const networkId = await provider.request({ method: 'net_version' })

      provider = new ethers.providers.Web3Provider(provider);
      const signer = provider.getSigner();
      bank.current = new Contract(
        "0x3AeED28a69848fe71c8EFde153fa0634A6107925",
        bankManifest.abi,
        signer
      );

    }
    return null;
  }
  let onSubmitDeposit = async (e) => {
    e.preventDefault();

    const BNBamount = parseFloat(e.target.elements[0].value);

    // Wei to BNB se pasa con ethers.utils recibe un String!!!
    const tx = await bank.current.deposit({
      value: ethers.utils.parseEther(String(BNBamount)),
      gasLimit: 6721975,
      gasPrice: 20000000000,
    });

    await tx.wait();
  }

  let clickWithdraw = async (e) => {
    await await bank.current.withdraw();
  }

  return (
    <div>
      <h1>Bank</h1>
      <form onSubmit={(e) => onSubmitDeposit(e)} >
        <input type="number" step="0.01" />
        <button type="submit">Deposit</button>
        <button onClick={() => clickWithdraw()} > Withdraw </button>

      </form>

    </div>
  )



}

export default Bank
