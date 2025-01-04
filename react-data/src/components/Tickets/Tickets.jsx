
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
  const [userBalance, setUserBalance] = useState('0');
  const [isBalanceSufficient, setIsBalanceSufficient] = useState(false);

  useEffect(() => {
    initContracts();
  }, [])

  let initContracts = async () => {
    await configureBlockchain();
    let tiketsFromBlockchain = await myContract.current?.getTikets();
    if (tiketsFromBlockchain != null)
      setTikets(tiketsFromBlockchain)
    await fetchBalances();
    await fetchUserBalance();
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
    if (!isBalanceSufficient) {
      alert('No tienes suficiente balance para comprar el tiket.');
      return;
    }

    try {
      const tx = await myContract.current.buyTiket(i, {
        value: ethers.utils.parseEther('0.02'),
        gasLimit: 6721975,
        gasPrice: 20000000000,
      });

      await tx.wait();

      await fetchTikets();
      await fetchBalances();
      await fetchUserBalance(); // Actualizamos el balance del usuario tras la compra
    } catch (error) {
      console.error('Error comprando tiket:', error);
    }
  };
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
  let fetchUserBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const balance = await provider.getBalance(userAddress);

      // Convertimos el balance a Ether
      const balanceInEth = ethers.utils.formatEther(balance);
      setUserBalance(balanceInEth);

      // Comprobamos si el balance es suficiente
      setIsBalanceSufficient(parseFloat(balanceInEth) >= 0.02);
    } catch (error) {
      console.error('Error obteniendo balance del usuario:', error);
    }
  };
  return (
    <div className="df">

      <div>
        <h1>Tickets</h1>
        <p><strong>Tu Balance (ETH):</strong> {userBalance}</p>
        {!isBalanceSufficient && (
          <p style={{ color: 'red' }}>No tienes suficiente balance para realizar una compra.</p>
        )}
      </div>

      <div>
        <h2>Tikets Disponibles</h2>
        <ul>
          {tikets.map((owner, index) => (
            <li key={index}>
              <strong>Tiket {index}:</strong> {owner || 'Disponible'}
              {owner === '0x0000000000000000000000000000000000000000' && (
                <button
                  onClick={() => clickBuyTiket(index)}
                  disabled={!isBalanceSufficient} // Deshabilita si el balance es insuficiente
                >
                  Comprar
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Acciones de Admin</h2>
        <p><strong>Balance Real del Contrato (ETH):</strong> {contractBalance}</p>
        <p><strong>Balance almacenado en balanceWei (Wei):</strong> {balanceWei}</p>
        <button onClick={withdrawBalance}>Retirar Balance</button>
        <form onSubmit={changeAdmin} className="dfv">
          <label>
            Cambiar Admin:
            <input type="text" placeholder="Nueva dirección de Admin" />
          </label>
          <button type="submit">Cambiar</button>
        </form>
      </div>
    </div>
  );
}


export default Tickets
