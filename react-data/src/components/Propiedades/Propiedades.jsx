import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import { Contract, ethers } from "ethers";
import { useState, useEffect, useRef } from 'react';
import realStateContractManifest from "../../contracts/RealStateContract.json";
import realStateContractCitiesManifest from "../../contracts/RealStateContractCities.json";



function Propiedades() {
  const realStateCities = useRef(null);
  const realState = useRef(null);
  const [realStateArray, setRealStateArray] = useState([])
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
      realState.current = new Contract(
        '0xAde4e77983fe5b307E5111cE51cc73e271E1d584',
        realStateContractManifest.abi,
        signer
      );
      realStateCities.current = new Contract(
        "0xcE626e667d3C833e09605460D81a44324C484751",
        realStateContractCitiesManifest.abi,
        signer
      );

    }
    return null;
  }
  let onSubmitAddRealState = async (e) => {
    e.preventDefault();

    const tx = await realStateCities.current.addRealState({
      city: e.target.elements[0].value,
      street: e.target.elements[1].value,
      number: parseInt(e.target.elements[2].value),
      meters: parseInt(e.target.elements[3].value),
      registration: parseInt(e.target.elements[4].value),
      owner: e.target.elements[5].value
    });


    await tx.wait();
  }
  let onSubmitSearchRealState = async (e) => {
    e.preventDefault();

    let city = e.target.elements[0].value;

    let newProperties = await realStateCities.current.getRealStateByCity(city);
    setRealStateArray(newProperties)
  }

  let clickOnDeleteRealState = async (registration) => {

    const tx = await realState.current.deleteRealStateByRegistration(registration);
    await tx.wait();
    setRealStateArray([])
  }

  return (
    <div>
      <h1>RealState</h1>
      <h2>Add RealState</h2>
      <form onSubmit={(e) => onSubmitAddRealState(e)} >
        <input type="text" placeholder="city" />
        <input type="text" placeholder="street" />
        <input type="number" placeholder="number" />
        <input type="number" placeholder="meters" />
        <input type="number" placeholder="registration" />
        <input type="text" placeholder="owner name" />
        <button type="submit">Add</button>
      </form>
      <h2>Search RealState</h2>
      <form onSubmit={(e) => onSubmitSearchRealState(e)} >
        <input type="text" placeholder="city" />
        <button type="submit">Search</button>
      </form>

      {realStateArray.map((r) =>
      (<p>
        <button onClick={() => { clickOnDeleteRealState(r.registration) }}>Delete</button>
        {r.city} -
        {r.street} -
        {ethers.BigNumber.from(r.number).toNumber()} -
        {ethers.BigNumber.from(r.meters).toNumber()} -
        {ethers.BigNumber.from(r.registration).toNumber()} -
        {r.owner}
      </p>)
      )}

    </div>
  )
}


export default Propiedades
