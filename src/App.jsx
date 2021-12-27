import React,{ useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';


const contractABI =abi.abi
const App = () => {
  const [tweetValue,setTweetValue] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
   const [allWaves, setAllWaves] = useState([]);
    const contractAddress = "0x3f873762D3236dBC7Ea526367D3e7f1aeE9e2701";
    

    const getAllWaves = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const WavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const waves = await WavePortalContract.getAllWaves();

      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

      setAllWaves(wavesCleaned);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};
 const checkIfWalletIsConnected = async () => {
    try {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
     const accounts = await ethereum.request({ method: 'eth_accounts' });
     if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }
 
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const WavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await WavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count... ${count.toNumber()}");
        const waveTxn = await WavePortalContract.wave(tweetValue,{gasLimit:300000});
        console.log("Mining...", waveTxn.hash);


        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await WavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}
   
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  useEffect(() => {
  let WavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log('NewWave', from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    WavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    WavePortalContract.on('NewWave', onNewWave);
  }

  return () => {
    if (WavePortalContract) {
      WavePortalContract.off('NewWave', onNewWave);
    }
  };
}, []);
 

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 What's good?
        </div>

        <div className="bio">
        I am Remi, Connect your Ethereum wallet and send a message!
        <br/> This is a website for sending anonymous message.Also some person might get some ETH on sending a message! <hr />
          <span style={{color:'Purple'}}>You must be connected to Metamask to leave a message.</span>
          <br /><br />
          <span style={{color:'red'}}>*a message can only be left once every 30seconds to prevent spam.</span>
        </div>
        <br /><br />
         {
          currentAccount ? (<textarea name="tweetArea"
            placeholder="type a message"
            type="text"
            id="tweet"
            value={tweetValue}
            onChange={e => setTweetValue(e.target.value)} />) : null
        }


        <button className="waveButton" onClick={wave}>
          Send a Message
        </button>
         
        {currentAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        
        
        {allWaves.map((wave, index) => {
            return (
              <div style={{ backgroundColor: 'yellow', marginTop: '16px', padding: '10px', borderRadius: '10px', borderLeftColor: 'blue', borderRightColor: 'blue', borderStyle: 'solid', borderTopColor: 'red', borderBottomColor: 'blue' }} key={wave.timestamp}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {<span style={{ color: 'blue' }}>{wave.message}</span>}</div>
              </div>
            )
          })
        }

        
      </div>
    </div>
  );
}
export default App
