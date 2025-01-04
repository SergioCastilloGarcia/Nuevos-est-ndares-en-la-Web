import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import { Contract, ethers } from "ethers";
import { useState, useEffect, useRef } from 'react';
import bankManifest from "../../contracts/Bank.json";


function Bank() {
  const bank = useRef(null);
  const [bnbBalance, setBnbBalance] = useState("0");
  const [tokenInterest, setTokenInterest] = useState("0");


  useEffect(() => {
    initContracts();// Consultar el saldo y los intereses al inicializar
  }, [])

  let initContracts = async () => {
    await getBlockchain();
    await fetchBalances();
  }

  let getBlockchain = async () => {
    let provider = await detectEthereumProvider();
    if (provider) {
      await provider.request({ method: 'eth_requestAccounts' });
      const networkId = await provider.request({ method: 'net_version' })

      provider = new ethers.providers.Web3Provider(provider);
      const signer = provider.getSigner();
      bank.current = new Contract(
        "0xe182F62FEA7EEe69D9AB117bba23085F5D7b6e49",
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
    await fetchBalances(); // Actualizar balances después del depósito
  }

  let clickWithdraw = async (e) => {
    try {
      const tx = await bank.current.withdraw();
      await tx.wait();
      await fetchBalances(); // Actualizar balances después del retiro
    } catch (error) {
      console.error("Error during withdrawal:", error);
    }
  }
  let fetchBalances = async () => {
    if (!bank.current) return;

    try {
      // Consultar saldo en BNB depositado
      const bnbBalance = await bank.current.getDepositBalance();
      setBnbBalance(ethers.utils.formatEther(bnbBalance));

      // Consultar interés generado en tokens
      const tokenInterest = await bank.current.calculateInterest();
      setTokenInterest(ethers.utils.formatUnits(tokenInterest, 18)); // Reducir escala de wei a entero

    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };
  return (
    <div className="center">
      <h1>Bank</h1>
      <p>Saldo depositado (BNB): {bnbBalance}</p>
      <p>Interés generado (BMIW): {tokenInterest}</p>
      <form className="center" onSubmit={(e) => onSubmitDeposit(e)}>
        <input type="number" step="0.01" placeholder="Monto en BNB" />
        <button type="submit">Depositar</button>
      </form>
      <button onClick={clickWithdraw}>Retirar</button>
    </div>
  )



}

export default Bank
