
import detectEthereumProvider from "@metamask/detect-provider";
import { Contract, ethers } from "ethers";
import myContractManifest from "../../contracts/MyContract.json";
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef } from 'react';


function Tickets() {
  const myContract = useRef(null);
  const [tikets, setTikets] = useState([]);
  const [contractBalance, setContractBalance] = useState(0);
  const [balanceWei, setBalanceWei] = useState(0);

  useEffect(() => {
    initContracts();
  }, [])

  let initContracts = async () => {
    await configureBlockchain();
    let tiketsFromBlockchain = await myContract.current?.getTikets();
    if (tiketsFromBlockchain != null)
      setTikets(tiketsFromBlockchain)
    await fetchBalances();
  }

  let configureBlockchain = async () => {
    try {
      let provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const networkId = await provider.request({ method: 'net_version' })

        provider = new ethers.providers.Web3Provider(provider);
        const signer = provider.getSigner();

        myContract.current = new Contract(
          '0xfC851cE9B6dE23EeFC72655BBbE23FB12BC94f38',
          myContractManifest.abi,
          signer
        );

      }
    } catch (error) { }
  }
  let clickBuyTiket = async (i) => {
    const tx = await myContract.current.buyTiket(i, {
      value: ethers.utils.parseEther("0.02"),
      gasLimit: 6721975,
      gasPrice: 20000000000,

    });

    await tx.wait();

    const tiketsUpdated = await myContract.current.getTikets();
    setTikets(tiketsUpdated);
    await fetchBalances();
  }
  let withdrawBalance = async () => {
    const tx = await myContract.current.transferBalanceToAdmin();
    await tx.wait();
    await fetchBalances();
  }
  let changeAdmin = async (e) => {
    //evita que avance a la página del formulario
    e.preventDefault();

    const adminAdress = e.target.elements[0].value;
    await myContract.current.changeAdmin(adminAdress);
  };

  let fetchBalances = async () => {
    try {
      const [realBalance, storedBalanceWei] = await myContract.current.getBalanceInfo();

      // Convertimos BigNumber a formato legible
      setContractBalance(ethers.utils.formatEther(realBalance)); // Balance real en Ether
      setBalanceWei(ethers.utils.formatUnits(storedBalanceWei, 'wei')); // Balance almacenado en Wei
    } catch (error) {
      console.error('Error obteniendo balances:', error);
    }
  };
  return (
    <div>
      <h1>Tikets store</h1>
      <p><strong>Balance Real del Contrato (ETH):</strong> {contractBalance}</p>
      <p><strong>Balance almacenado en balanceWei (Wei):</strong> {balanceWei}</p>
      <button onClick={() => withdrawBalance()}>Withdraw Balance</button>

      <ul>
        {tikets.map((address, i) =>
          <li>Tiket {i} comprado por {address}
            {address == ethers.constants.AddressZero &&
              <a href="#" onClick={() => clickBuyTiket(i)}> buy</a>}

          </li>
        )}
      </ul>

      <form onSubmit={(e) => changeAdmin(e)}>

        <input type="text" />
        <button type="submit" > Donate </button>
      </form>

    </div>
  )

}

export default Tickets
