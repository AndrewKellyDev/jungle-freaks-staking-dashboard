import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {
  connectWallet,
  getCurrentWalletConnected,
  getJFTBalance,
  getStakedTokensCall,
} from "../Utilities/Web3Utilities";
import { Images } from "../data/images";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";

const Card = styled.div`
  background: rgba(0, 0, 0, 0.6);
  max-width: 800px;
  min-width: 320px;
  padding: 40px 40px;
  border-radius: 30px;
  text-align: center;
  @media (max-width: 374px) {
    min-width: 300px;
  }
`;

const Button = styled.button`
  background: #f59e0c;
  font-size: 20px;
  width: 100%;
  padding: 10px 0;
  border-radius: 8px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const Connect = () => {
  const [walletAddress, setWallet] = useState("");
  const [hasFreaks, setHasFreaks] = useState(false);
  const dispatch = useDispatch();
  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setWallet(walletResponse.address);
  };

  const WalletNotConnected = () => {
    return <p onClick={() => connectWalletPressed()}>CONNECT WALLET</p>;
  };

  const WalletConnected = () => {
    return <p>GO TO DASHBOARD</p>;
  };

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          setWallet("");
        }
      });
    } else {
      console.log("error");
    }
  }

  const handleWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        infuraId: "ed179c7b46274bfa85fe97c84a9ab9e8",
      });
      await provider.enable();
      const web3 = new Web3(provider);
      localStorage.setItem("provider", provider);
      const accounts = await web3.eth.getAccounts();
      setWallet(accounts[0]);
      localStorage.setItem("address", accounts[0]);
      navigate("/home/collection");

      provider.on("connect", () => {
        console.log("connect");
        alert("hi");
        console.log(accounts[0]);
        navigate("/home/collection");
      });
      provider.on("accountsChanged", (accounts) => {
        console.log(accounts);
      });

      // Subscribe to chainId change
      provider.on("chainChanged", (chainId) => {
        console.log(chainId);
      });

      // Subscribe to session disconnection
      provider.on("disconnect", (code, reason) => {
        console.log(code, reason);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    async function call() {
      const { address } = await getCurrentWalletConnected();
      if (address) {
        const JFTbalance = await getJFTBalance(address);
        const stakedTokens = await getStakedTokensCall(address);
        if (JFTbalance > 0 || stakedTokens.length > 0) setHasFreaks(true);
      }
      setWallet(address);
      addWalletListener();
    }
    call();
  }, [walletAddress]);

  const navigate = useNavigate();

  const handleConnect = () => {
    if (hasFreaks) navigate("/home/collection");
    else {
      Swal.fire({
        text: "You have no freaks",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="w-full h-screen bg-home bg-cover flex justify-center items-center text-white">
      <Card>
        <div className="flex justify-center items-center">
          <img src={Images.logo} alt="logo" />
        </div>
        <div className="md:text-4xl text-lg md:mt-14 mt-5 md:mb-10 mb-6">
          {"CONNECT WALLET"}
        </div>
        <div className="md:text-lg text-xxs md:mb-8 mb-4">
          {"Connect your wallet to see the dash"}
        </div>
        <Button
          onClick={
            !walletAddress
              ? () => connectWalletPressed()
              : () => handleConnect()
          }
        >
          {!walletAddress ? <WalletNotConnected /> : <WalletConnected />}
        </Button>
        <div
          className="text-center md:mt-12 mt-5 md:text-base text-xxs cursor-pointer"
          onClick={handleWalletConnect}
        >
          {"Connect WalletConnect"}
        </div>
      </Card>
    </div>
  );
};

export default Connect;
