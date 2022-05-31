import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const App = () => {

  // Just a state variable we use to store our user's public wallet.
  const [currentAccount, setCurrentAccount] = useState("");

  // All state property to store all waves
  const [allWaves, setAllWaves] = useState([]);

  // Renew this when you perform redeploy smartcontract
  const contractAddress = "0x68be02099571B9F3412ceE84a015e56a57C22A32";
  // References the abi content!
  const contractABI = abi.abi;

  // Method to check if wallet is connected to the site
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      //check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Connect wallet implementation
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      // If no metamask installed, alert!
      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      // ask ethereum to use user account with method eth_requestAccounts
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  // Wave method implementation
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        // use contractAddress, contractABI
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // reference from smartContract method getTotalWaves
        let count = await wavePortalContract.getTotalWaves();
        // Print wave count before
        console.log("Retrieved total wave count...", count.toNumber());

        // execute the actual wave from your smart contract
        const waveTxn = await wavePortalContract.wave("Hi There!");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        // print wave count after
        console.log("Retrieved total wave count ", count.toNumber());
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Get All waves method implementation
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Call the getAllWaves method from smart contract
        const waves = await wavePortalContract.getAllWaves();

        // Redefining waves objects
        let redefinedWaves = [];
        waves.forEach(wave => {
          redefinedWaves.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        // Store data in react state
        setAllWaves(redefinedWaves);
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Listen in for emitter events
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState, {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);
  
  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          I am haziqkamel and I worked on blockchain so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        {// Create a textfield to get user message
          /*<form>
          <div class="form-control">
            <input type="text" required/>
          </div>
        </form>*/
        }
        
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {// If there is no currentAccount render this button 
        }
        {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
        Connect Wallet
        </button>
        )}

        {allWaves.map((wave , index) => {
      return (
        <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
          <div>Address: {wave.address}</div>
          <div>Time: {wave.timestamp.toString()}</div>
          <div>Message: {wave.message}</div>
        </div>
      );
        })}
      </div>
    </div>
  );
}

export default App