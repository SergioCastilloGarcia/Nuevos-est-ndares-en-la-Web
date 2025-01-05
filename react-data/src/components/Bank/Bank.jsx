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
  const [bnbBalanceSpecial, setBnbBalanceSpecial] = useState("0");
  const [tokenInterestSpecial, setTokenInterestSpecial] = useState("0");


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
        "0x07A6255C94E227e39f8e508902AaFbCF9e16e113",
        bankManifest.abi,
        signer
      );

    }
    return null;
  }
  let onSubmitDeposit = async (e) => {
    e.preventDefault();

    const BNBamount = parseFloat(e.target.elements[0].value);

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
      const tx = await bank.current.withdraw({
        value: ethers.utils.parseEther('0.05'),
        gasLimit: 6721975,
        gasPrice: 20000000000,
      });
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
    try {

      // Consultar saldo en BNB depositado
      const bnbBalanceSpecial = await bank.current.getDepositBalanceSpecial();
      setBnbBalanceSpecial(ethers.utils.formatEther(bnbBalanceSpecial));

      // Consultar interés generado en tokens
      const tokenInterestSpecial = await bank.current.calculateInterestSpecial();
      setTokenInterestSpecial(ethers.utils.formatUnits(tokenInterestSpecial, 18)); // Reducir escala de wei a entero
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };
  let onSubmitSpecialDeposit = async (e) => {
    e.preventDefault();

    const BNBamount = parseFloat(e.target.elements[0].value);
    const tx = await bank.current.specialDeposit({
      value: ethers.utils.parseEther(String(BNBamount)),
      gasLimit: 6721975,
      gasPrice: 20000000000,
    });

    await tx.wait();
    await fetchBalances(); // Actualizar balances después del retiro
  };

  let clickSpecialWithdraw = async () => {

    try {
      const tx = await bank.current.specialWithdraw({
        value: ethers.utils.parseEther('0.05'),
        gasLimit: 6721975,
        gasPrice: 20000000000,
      });
      await tx.wait();
      await fetchBalances(); // Actualizar balances después del retiro
    } catch (error) {
      console.error("Error during withdrawal:", error);
    }
  };
  return (
    <div className="df">
      <div>
        <a href='/'>Volver</a>
        <h1>Bank</h1>

        <p>Saldo depositado (BNB): {bnbBalance}</p>
        <p>Interés generado (BMIW): {tokenInterest}</p>
        <form onSubmit={(e) => onSubmitDeposit(e)}>
          <input type="number" step="0.01" placeholder="Monto en BNB" />
          <button type="submit">Depositar</button>
        </form>
        <button onClick={clickWithdraw}>Retirar</button>
      </div>
      <div>
        <h1>Special Bank</h1>

        <p>Saldo depositado (BNB): {bnbBalanceSpecial}</p>
        <p>Interés generado (BMIW): {tokenInterestSpecial}</p>
        <form onSubmit={(e) => onSubmitSpecialDeposit(e)}>
          <input type="number" step="0.01" placeholder="Monto en BNB" />
          <button type="submit">Depósito Especial</button>
        </form>
        <button onClick={() => clickSpecialWithdraw()}>Retiro Especial</button>
      </div>
    </div>
  )



}

export default Bank
