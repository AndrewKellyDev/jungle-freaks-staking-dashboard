import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { isMobile } from "react-device-detect";

let selectedAccount;

const provider = new WalletConnectProvider({
  infuraId: "ed179c7b46274bfa85fe97c84a9ab9e8",
});

isMobile && provider.enable();

const web3 = new Web3(Web3.givenProvider || provider);

const JungleFreaksContractAbi = require("../abi/jungle_freaks.json");
const JFTAbi = require("../abi/jft.json");
const ERC1155Abi = require("../abi/erc1155.json");
// // test
// export const LEGENDARY_COFT_ID =
//   "64396628092031731206525383750081342765665389133291640817070595755125256486927";
// export const LEGENDARY_MTFM_ID =
//   "64396628092031731206525383750081342765665389133291640817070595754025744859163";

export const LEGENDARY_COFT_ID =
  "64396628092031731206525383750081342765665389133291640817070595755125256486927";
export const LEGENDARY_MTFM_ID =
  "64396628092031731206525383750081342765665389133291640817070595754025744859163";

// // test
// const JungleFreaksContractAddress =
//   "0x5684d468CBc70468E77c690617f44802eD412139";

const JungleFreaksContractAddress =
  "0x4d648c35212273d638a5e602ab1177bb75ad7946";

//   // test
// export const JFTContractAddress = "0xCB13b19ac650417b88eD0f231719Be3B340bAa1d";
export const JFTContractAddress = "0x7e6bc952d4b4bd814853301bee48e99891424de0";

// test
// const ERC1155TokenAddress = "0x2bc4113e327FE17c854cD47ACfc1cFAA9Bb2A923";
const ERC1155TokenAddress = "0x495f947276749ce646f68ac8c248420045cb7b5e";

const JungleFreaksContract = new web3.eth.Contract(
  JungleFreaksContractAbi,
  JungleFreaksContractAddress
);

const ERC1155Contract = new web3.eth.Contract(ERC1155Abi, ERC1155TokenAddress);

export const JFTContract = new web3.eth.Contract(JFTAbi, JFTContractAddress);

export const humanReadableAccount = (account) => {
  return account.slice(0, 6) + "..." + account.slice(account.length - 4);
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "",
        address: addressArray[0],
      };
      selectedAccount = addressArray[0];
      return obj;
    } catch (err) {
      return {
        address: "",
        status: err.message,
      };
    }
  } else {
    return {
      address: "",
      status: "",
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        selectedAccount = addressArray[0];
        return {
          address: addressArray[0],
          status: "",
        };
      } else {
        return {
          address: "" || localStorage.getItem("address"),
          status: "",
        };
      }
    } catch (err) {
      return {
        address: "" || localStorage.getItem("address"),
        status: err.message,
      };
    }
  } else {
    return {
      address: "" || localStorage.getItem("address"),
      status: "",
    };
  }
};

export const getStakedTokensCall = async (
  address = selectedAccount || localStorage.getItem("address")
) => {
  return await JungleFreaksContract.methods.getStakedTokens(address).call();
};

export const legendariesStaked = async (address) => {
  return await JungleFreaksContract.methods.legendariesStaked(address).call();
};

export const stakeById = (tokenID, address) => {
  return JungleFreaksContract.methods
    .stakeById(tokenID)
    .send({ from: address });
};

export const stakeLegendaries = (cotf, mtfm) => {
  return JungleFreaksContract.methods
    .stakeLegendaries(cotf, mtfm)
    .send({ from: selectedAccount || localStorage.getItem("address") });
};

export const unstakeByIds = (tokenID) => {
  return JungleFreaksContract.methods
    .unstakeByIds(tokenID)
    .send({ from: selectedAccount || localStorage.getItem("address") });
};

export const unstakeAll = () => {
  return JungleFreaksContract.methods
    .unstakeAll()
    .send({ from: selectedAccount || localStorage.getItem("address") });
};

export const unstakeLegendaries = (tokenID, amount) => {
  return JungleFreaksContract.methods
    .unstakeLegendaries(tokenID, amount)
    .send({ from: selectedAccount || localStorage.getItem("address") });
};

export const claimReward = () => {
  return JungleFreaksContract.methods
    .claimAll()
    .send({ from: selectedAccount || localStorage.getItem("address") });
};

export const claimLegendaries = () => {
  return JungleFreaksContract.methods
    .claimLegendaries()
    .send({ from: selectedAccount || localStorage.getItem("address") });
};

export const getUnclaimedReward = (address) => {
  return JungleFreaksContract.methods.getAllRewards(address).call();
};

export const getLegendariesRewards = (address) => {
  return JungleFreaksContract.methods.getLegendariesRewards(address).call();
};

export const toWei = (_balaceWei) => {
  return web3.utils.fromWei(_balaceWei);
};

export const getBalance = (address) => {
  return JungleFreaksContract.methods.balanceOf(address).call();
};

export const getJFTBalance = (address) => {
  return JFTContract.methods.balanceOf(address).call();
};

export const setApprovalForAll = () => {
  return JFTContract.methods
    .setApprovalForAll(JungleFreaksContractAddress, true)
    .send({ from: selectedAccount || localStorage.getItem("address") });
};

export const isApprovedForAll = (account) => {
  return JFTContract.methods
    .isApprovedForAll(account, JungleFreaksContractAddress)
    .call();
};

export const setApprovalForAll1155 = () => {
  return ERC1155Contract.methods
    .setApprovalForAll(JungleFreaksContractAddress, true)
    .send({ from: selectedAccount || localStorage.getItem("address") });
};

export const isApprovedForAll1155 = (account) => {
  return ERC1155Contract.methods
    .isApprovedForAll(account, JungleFreaksContractAddress)
    .call();
};

export const legendaryCotfBalanceOf = (address) => {
  return ERC1155Contract.methods.balanceOf(address, LEGENDARY_COFT_ID).call();
};

export const legendaryMtfmBalanceOf = (address) => {
  return ERC1155Contract.methods.balanceOf(address, LEGENDARY_MTFM_ID).call();
};
