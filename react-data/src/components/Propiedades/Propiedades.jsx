import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import { Contract, ethers } from "ethers";
import { useState, useEffect, useRef } from 'react';
import realStateContractManifest from "../../contracts/RealStateContract.json";
import realStateContractRegistrationsManifest from "../../contracts/RealStateContractRegistrations.json";



function Propiedades() {
  const realStateRegistrations = useRef(null);
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
      realStateRegistrations.current = new Contract(
        "0xa2e467Ef32Ec16FF90002bd318d6462Ce122B4b8",
        realStateContractRegistrationsManifest.abi,
        signer
      );

    }
    return null;
  }
  let onSubmitAddRealState = async (e) => {
    e.preventDefault();
    try {
      const tx = await realStateRegistrations.current.addRealState({
        city: e.target.elements[0].value,
        street: e.target.elements[1].value,
        number: parseInt(e.target.elements[2].value),
        meters: parseInt(e.target.elements[3].value),
        registration: parseInt(e.target.elements[4].value),
        owner: e.target.elements[5].value
      });


      await tx.wait();
    } catch (error) {
      alert("No tienes permisos");
    }
  }
  let onSubmitSearchRealState = async (e) => {
    e.preventDefault();

    let registration = parseInt(e.target.elements[0].value);

    try {
      let property = await realStateRegistrations.current.getRealStateByRegistration(registration);
      setRealStateArray([property]);
    } catch (error) {
      console.error("Property not found", error);
      setRealStateArray([]);
    }
  }
  let clickOnDeleteRealState = async (registration) => {

    try {
      const tx = await realStateRegistrations.current.deleteRealStateByRegistration(registration);
      await tx.wait();
      setRealStateArray([])
    } catch (error) {
      console.error("Property not found", error);
    }
  }
  let onSubmitAddAuthorizedAddress = async (e) => {
    e.preventDefault();

    const tx = await realStateRegistrations.current.addAuthorizedAddress(
      e.target.elements[0].value // Dirección autorizada
    );

    await tx.wait();
    alert("Authorized address added successfully");
  };
  return (
    <div>
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
      </div>
      <div>
        <h2>Search RealState</h2>
        <form onSubmit={(e) => onSubmitSearchRealState(e)} >
          <input type="number" placeholder="registration" />
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
      <div>
        <h2>Add Authorized Address (Admin Only)</h2>
        <form onSubmit={(e) => onSubmitAddAuthorizedAddress(e)}>
          <input type="text" placeholder="authorized address" />
          <button type="submit">Add</button>
        </form>

      </div>
    </div>
  )
}


export default Propiedades
