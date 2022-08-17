import { Images } from "../data/images";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBalance,
  toWei,
  getCurrentWalletConnected,
} from "../Utilities/Web3Utilities";

const Info = () => {
  const dispatch = useDispatch();
  const stakedLegendaryTokenIds = useSelector(
    (state) => state.stakedLegendaryTokenIds
  );
  const stakedTokenIds = useSelector((state) => state.stakedTokenIds);
  const unstakedTokens = useSelector((state) => state.unstakedTokens)?.filter(
    (data) => !stakedTokenIds.includes(data.tokenId)
  );

  const legendaryBalance = useSelector(
    (state) =>
      parseInt(state.legendaryCotfBalance) +
      parseInt(state.legendaryMtfmBalance)
  );
  const legendaryStakedTokenCount = useSelector(
    (state) =>
      parseInt(state.stakedLegendaryTokenIds.cotfStaked) +
      parseInt(state.stakedLegendaryTokenIds.mtfmStaked)
  );

  const totalTokenCount = stakedTokenIds.length + unstakedTokens.length;

  const unclaimedRewardTotal = useSelector((state) =>
    (
      parseFloat(state.unclaimedReward) + parseFloat(state.unclaimedReward1155)
    ).toFixed(2)
  );
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
    <div className="grid-cols-5 2xl:px-8 xl:px-8 px-4 py-16 border-t border-b border-white border-solid hidden llg:grid gap-5">
      <div className="flex justify-center gap-3">
        <div>
          <img src={Images.icons.jungle} width={50} alt="jungle" />
        </div>
        <div>
          <div className="2xl:text-lg xl:text-base text-sm mb-1">
            <span className="text-primary">{`+${
              stakedTokenIds.length * 10 +
              parseInt(stakedLegendaryTokenIds.cotfStaked) * 35 +
              parseInt(stakedLegendaryTokenIds.mtfmStaked) * 15
            } $JUNGLE`}</span>
          </div>
          <div className="font-poppins xl:text-sm text-xs">
            {"Daily Rewards"}
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <div>
          <img src={Images.icons.palmTree} width={50} alt="palmTree" />
        </div>
        <div>
          <div className="2xl:text-lg xl:text-base text-sm mb-1">
            {`${stakedTokenIds.length} Freak(s)`}
          </div>
          <div className="font-poppins xl:text-sm text-xs">
            {"Your staked Freaks"}
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <div>
          <img src={Images.icons.jungle} width={50} alt="jungle" />
        </div>
        <div>
          <div className="2xl:text-lg xl:text-base text-sm mb-1 text-primary">
            {unclaimedRewardTotal + " $JUNGLE"}
          </div>
          <div className="font-poppins xl:text-sm text-xs">
            {"Pending Rewards"}
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <div>
          <img src={Images.icons.jungle} width={50} alt="ethereum" />
        </div>
        <div>
          <div className="2xl:text-lg xl:text-base text-sm mb-1">
            {accountBalance + " $JUNGLE"}
          </div>
          <div className="font-poppins xl:text-sm text-xs">{"Balance"}</div>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <div>
          <img src={Images.icons.palmTree} width={50} alt="palmTree" />
        </div>
        <div>
          <div className="2xl:text-lg xl:text-base text-sm mb-1">
            {totalTokenCount + " Freak(s)"}
          </div>
          <div className="font-poppins xl:text-sm text-xs">
            {"Total Freaks"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
