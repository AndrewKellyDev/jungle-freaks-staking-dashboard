import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { Images } from "../../data/images";
import { JFTContractAddress } from "../../Utilities/Web3Utilities";

const SideBarWrap = styled.div`
  background: #f59e0c;
  display: flex;
  flex-direction: column;
  padding-top: 30px;
  height: 100%;
  .active {
    background: #000000;
  }
  width: 250px;
  @media (max-width: 1180px) {
    display: none;
  }
`;

const NavItem = styled(NavLink)`
  color: #ffffff;
  font-size: 14px;
  padding: 20px 40px;
  transition: all ease 0.4s;
  font-weight: 600;
  &:hover {
    background: #000000;
  }
`;
const handleImport = async () => {
  const tokenSymbol = "$JUNGLE";
  const tokenDecimals = 18;
  const tokenImage = "https://imgur.com/w9jAaQF.png";

  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20", // Initially only supports ERC20, but eventually more!
        options: {
          address: "0x4d648c35212273d638a5e602ab1177bb75ad7946", // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals,
          image: tokenImage, // The number of decimals in the token
        },
      },
    });

    if (wasAdded) {
      console.log("Thanks for your interest!");
    } else {
      console.log("Your loss!");
    }
  } catch (error) {
    console.log(error);
  }
};

const SideBar = () => {
  return (
    <SideBarWrap>
      <div className="flex justify-center items-center mb-20">
        <img src={Images.logo} alt="logo" />
      </div>
      <div className="flex flex-col mt-20">
        <NavItem to={`collection`} activeclassname="active">
          {"COLLECTION"}
        </NavItem>
        <NavItem to={`staking`} activeclassname="active">
          {"STAKING"}
        </NavItem>
        {/* <NavItem to={`leaderboard`} activeclassname="active">
          {"LEADERBOARD"}
        </NavItem> */}
        <button
          onClick={handleImport}
          className="mx-5 bg-primary text-white font-bold rounded-3xl text-xs px-4 py-2 mt-5"
        >
          Add $JUNGLE To Metamask
        </button>
      </div>
    </SideBarWrap>
  );
};

export default SideBar;
