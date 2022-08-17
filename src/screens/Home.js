import styled from "styled-components";
import { useRef, useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { NavLink, useLocation } from "react-router-dom";
import { GoChevronLeft } from "react-icons/go";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";

/*====== components =======*/
import Info from "../components/Info";
import SideBar from "../components/sidebar";

/*====== image src =======*/
import { Images } from "../data/images";

import {
  getCurrentWalletConnected,
  legendariesStaked,
  getStakedTokensCall,
} from "../Utilities/Web3Utilities";

const MobileSidebar = styled.div`
  position: fixed;
  background: #000000;
  top: 0;
  right: 0;
  padding: 100px 50px;
  color: #ffffff;
  height: 100%;
  transform-origin: right center;
  transform: scaleX(0);
  transition: all 0.5s;
  font-size: 32px;
  z-index: 99;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Home = () => {
  const dispatch = useDispatch();
  const [hamburgerStatus, setHamburgerShow] = useState(false);
  const sidebarRef = useRef(null);

  const natigate = useNavigate();
  const location = useLocation();
  const title = location.pathname.slice(6);

  const toggleVisible = () => {
    if (hamburgerStatus) {
      setHamburgerShow(false);
      sidebarRef.current.style.transform = "scaleX(0)";
    } else {
      setHamburgerShow(true);
      sidebarRef.current.style.transform = "scaleX(1)";
    }
  };

  const handleNavigateBack = () => {
    natigate(-1);
  };

  async function updateStakedTokens() {
    const { address } = await getCurrentWalletConnected();
    const stakedTokens = await getStakedTokensCall(
      address || localStorage.getItem("address")
    );
    dispatch({ type: "UPDATE_STAKEDTOKENIDS", payload: stakedTokens });
    const stakedLegendaryTokens = await legendariesStaked(address);
    dispatch({
      type: "UPDATE_LEGENDARY_STAKED_TOKENS",
      payload: stakedLegendaryTokens,
    });
  }

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
            image: tokenImage, // he number of decimals in the token
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

  useEffect(() => {
    updateStakedTokens();
  }, []);

  return (
    <div className="flex min-h-screen">
      <div ref={sidebarRef}>
        <SideBar />
      </div>
      <div className="bg-home bg-contain w-full h-full text-white">
        <div className="h-36 flex llg:items-center items-end">
          <div className="llg:bg-transparent bg-black w-full flex justify-between items-center relative llg:border-none	border-solid border-b border-white	">
            <div className="llg:hidden block absolute right-1/2 translate-x-1/2 transform bottom-6">
              <img src={Images.logo} alt="logo" height="77" width="77" />
            </div>
            <div className="llg:px-10 px-5 py-5">
              {location.pathname === "/home/staking/confirmstake" ||
              location.pathname === "/home/staking/confirmunstake" ||
              location.pathname === "/home/staking/confirmlegendarystake" ||
              location.pathname === "/home/staking/confirmlegendaryunstake" ? (
                <button onClick={handleNavigateBack} className="text-3xl">
                  <GoChevronLeft />
                </button>
              ) : (
                <div className="llg:text-4xl text-sm uppercase font-black">
                  {title}
                </div>
              )}
            </div>

            <div
              className={"mr-5 hamburger " + (hamburgerStatus ? "active" : "")}
              onClick={toggleVisible}
            >
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </div>
            <MobileSidebar ref={sidebarRef} onClick={() => toggleVisible()}>
              <div className="text-white flex flex-col items-center">
                <NavLink to="collection" className="my-2">
                  {"COLLECTION"}
                </NavLink>
                <NavLink to="staking" className="my-2">
                  {"STAKING"}
                </NavLink>
                <button
                  onClick={handleImport}
                  className="bg-primary text-xl text-white font-bold rounded-3xl px-4 py-2 mt-4"
                >
                  Add $JUNGLE To Metamask
                </button>
              </div>
            </MobileSidebar>
          </div>
        </div>
        <div className="bg-black">
          <Info />
          <Outlet />
        </div>
      </div>
      <ToastContainer
        className="text-white"
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Home;
