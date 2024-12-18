
import detectEthereumProvider from "@metamask/detect-provider";
import { Contract, ethers } from "ethers";
import myContractManifest from "../../contracts/MyContract.json";
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef } from 'react';


function Tickets() {
  const myContract = useRef(null);
  const [tikets, setTikets] = useState([]);

  useEffect(() => {
    initContracts();
  }, [])

  let initContracts = async () => {
    await configureBlockchain();
    let tiketsFromBlockchain = await myContract.current?.getTikets();
    if (tiketsFromBlockchain != null)
      setTikets(tiketsFromBlockchain)
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
          '0x23FDBF472ec9Bd4201Dd8b6774670bDF901Df2D0',
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
  }
  let withdrawBalance = async () => {
    const tx = await myContract.current.transferBalanceToAdmin();
  }
  let changeAdmin = async (e) => {
    //evita que avance a la página del formulario
    e.preventDefault();

    const adminAdress = e.target.elements[0].value;
    await myContract.current.changeAdmin(adminAdress);
  };


  return (
    <div>
      <h1>Tikets store</h1>
      <button onClick={() => withdrawBalance()}>Withdraw Balance</button>

      <ul>
        {tikets.map((address, i) =>
          <li>Tiket {i} comprado por {address}
            {address == ethers.constants.AddressZero &&
              <a href="#" onClick={() => clickBuyTiket(i)}> buy</a>}

          </li>
        )}
      </ul>

      <form className="form-inline" onSubmit={(e) => changeAdmin(e)}>
        <input type="text" />
        <button type="submit" > Donate </button>
      </form>

    </div>
  )

}

export default Tickets
