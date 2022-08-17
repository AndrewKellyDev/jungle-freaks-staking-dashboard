import { Outlet, useLocation, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

import {
  getCurrentWalletConnected,
  getBalance,
  toWei,
} from "../../Utilities/Web3Utilities";
import StakeCard from "./StakeCard";
import { Images } from "../../data/images";
import LegendaryCard from "./LegendaryCard";

const Staking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();

  const stakedTokenIDs = useSelector((state) => state.stakedTokenIds);
  const unstakedTokens = useSelector((state) => state.unstakedTokens)?.filter(
    (data) => !stakedTokenIDs.includes(data.tokenId)
  );
  const stakedLegendaryTokenIds = useSelector(
    (state) => state.stakedLegendaryTokenIds
  );
  const unclaimedRewardTotal = useSelector((state) =>
    (
      parseFloat(state.unclaimedReward) + parseFloat(state.unclaimedReward1155)
    ).toFixed(2)
  );

  const totalTokenCount = stakedTokenIDs.length + unstakedTokens.length;

  const accountBalance = useSelector((state) => state.accountBalance);

  const loadData = async () => {
    const { address } = await getCurrentWalletConnected();
    getBalance(address).then((res) =>
      dispatch({
        type: "SET_ACCOUNT_BALANCE",
        payload: parseFloat(toWei(res)).toFixed(2),
      })
    );
  };

  useEffect(() => {
    loadData();
  }, []);
  return (
    <div>
      <div
        className={
          location.pathname === "/home/staking/confirmstake" ||
          location.pathname === "/home/staking/confirmunstake" ||
          location.pathname === "/home/staking/confirmlegendarystake" ||
          location.pathname === "/home/staking/confirmlegendaryunstake"
            ? "hidden"
            : "block"
        }
      >
        <div className="flex md:hidden flex-col">
          <div className="flex flex-col justify-center items-center bg-yellowOne py-5">
            <div>
              <img src={Images.icons.palmTree} width={50} alt="palmTree" />
            </div>

            <div className="text-xl my-2">
              {totalTokenCount}
              {" FREAK(S)"}
            </div>
            <div className="font-poppins text-sm">
              {"Total Available Freak(s)"}
            </div>
          </div>
          <div className={"grid grid-cols-2"}>
            <div className="flex px-4 py-6 border-white border">
              <div className="mr-4">
                <img
                  src={Images.icons.jungle}
                  alt="jungle"
                  className="sm:w-10 w-6"
                />
              </div>
              <div>
                <div className="sm:text-xl xs:text-sm text-xs mb-1">
                  <span className="text-primary">{`+${
                    stakedTokenIDs.length * 10 +
                    parseInt(stakedLegendaryTokenIds.cotfStaked) * 35 +
                    parseInt(stakedLegendaryTokenIds.mtfmStaked) * 15
                  } $JUNGLE`}</span>
                </div>
                <div className="font-poppins sm:text-sm text-xxs">
                  {"Daily Rewards"}
                </div>
              </div>
            </div>
            <div className={"flex px-4 p-6 border-white border"}>
              <div className="mr-4">
                <img
                  src={Images.icons.palmTree}
                  alt="palmTree"
                  width={50}
                  className="sm:w-6 w-4"
                />
              </div>
              <div>
                <div className="sm:text-xl xs:text-sm text-xs mb-1">
                  {`${stakedTokenIDs.length} Freaks`}
                </div>
                <div className="font-poppins sm:text-sm text-xxs">
                  {"Your Staked Freak(s)"}
                </div>
              </div>
            </div>
            <div className="flex px-4 py-6 border-white border">
              <div className="mr-4">
                <img
                  src={Images.icons.jungle}
                  alt="jungle"
                  className="sm:w-10 w-6"
                />
              </div>
              <div>
                <div className="sm:text-xl xs:text-sm text-xs mb-1 text-primary">
                  {unclaimedRewardTotal}
                  {" $JUNGLE"}
                </div>
                <div className="font-poppins sm:text-sm text-xxs">
                  {"Pending Rewards"}
                </div>
              </div>
            </div>
            <div className="flex px-4 py-6 border-white border">
              <div className="mr-4">
                <img
                  src={Images.icons.jungle}
                  alt="ethereum"
                  className="sm:w-6 w-4"
                />
              </div>
              <div>
                <div className="sm:text-xl xs:text-sm text-xs mb-1">
                  {accountBalance}
                  {" $JUNGLE"}
                </div>
                <div className="font-poppins sm:text-sm text-xxs">
                  {"Balance"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 font-semibold text-xl md:hidden block text-center">
          FREAK(S)
        </div>
        <div className="text-center text-sm md:hidden block px-2 mt-2">
          Choose an Action and Select Your Freak(s)
        </div>
        <div className={"md:hidden flex justify-around mt-10 mb-32 "}>
          <button
            onClick={() => {
              navigate("confirmstake");
            }}
            className="bg-primary rounded-xl py-2 w-32"
          >
            {"STAKE"}
          </button>
          <button
            onClick={() => navigate("confirmunstake")}
            className="bg-primary rounded-xl py-2 w-32"
          >
            {"UNSTAKE"}
          </button>
        </div>
        <div className="text-center font-semibold text-xl md:hidden block">
          LEGENDARY ASSET(S)
        </div>
        <div className="text-center text-sm md:hidden block px-2 mt-2">
          Choose an Action and Select your Legendary Asset(s)
        </div>

        <div className={"md:hidden flex justify-around mt-10 mb-40 "}>
          <button
            onClick={() => {
              navigate("confirmlegendarystake");
            }}
            className="bg-third rounded-xl py-2 w-32"
          >
            {"STAKE"}
          </button>
          <button
            onClick={() => navigate("confirmlegendaryunstake")}
            className="bg-third rounded-xl py-2 w-32"
          >
            {"UNSTAKE"}
          </button>
        </div>
      </div>
      <div className="px-10 pt-10 pb-6 text-4xl hidden md:block">
        {"STAKE FREAK(S)"}
      </div>

      <div
        className={
          "p-5 lg:grid-cols-2 grid-cols-1 gap-10 " +
          (location.pathname === "/home/staking/confirmstake" ||
          location.pathname === "/home/staking/confirmunstake" ||
          location.pathname === "/home/staking/confirmlegendarystake" ||
          location.pathname === "/home/staking/confirmlegendaryunstake"
            ? "hidden"
            : "grid")
        }
      >
        <StakeCard type="stake" key="1" />
        <StakeCard type="unstake" key="2" />
      </div>
      <div className="px-10 pt-10 pb-6 text-4xl  hidden md:block">
        {"STAKE LEGENDARY ASSET(S)"}
      </div>

      <div
        className={
          "p-5 lg:grid-cols-2 grid-cols-1 gap-10 " +
          (location.pathname === "/home/staking/confirmstake" ||
          location.pathname === "/home/staking/confirmunstake" ||
          location.pathname === "/home/staking/confirmlegendarystake" ||
          location.pathname === "/home/staking/confirmlegendaryunstake"
            ? "hidden"
            : "grid")
        }
      >
        <LegendaryCard type="stake" key="3" />
        <LegendaryCard type="unstake" key="4" />
      </div>

      <Outlet />
    </div>
  );
};

export default Staking;
