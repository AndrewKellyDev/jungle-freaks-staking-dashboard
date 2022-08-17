import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BsCheckCircleFill } from "react-icons/bs";
import { toast } from "react-toastify";

import { Images } from "../../data/images";
import {
  legendaryMtfmBalanceOf,
  legendaryCotfBalanceOf,
  getCurrentWalletConnected,
  legendariesStaked,
  LEGENDARY_COFT_ID,
  LEGENDARY_MTFM_ID,
  claimLegendaries,
  getLegendariesRewards,
  toWei,
  unstakeLegendaries,
  getBalance,
} from "../../Utilities/Web3Utilities";

const ConfirmLegendaryUnstake = () => {
  const dispatch = useDispatch();

  const unstakeIdInputRef = useRef(null);

  const [unstakeCoftSelectionStatus, setUnstakeCoftSelectionStatus] =
    useState(false);
  const [unstakeMtfmSelectionStatus, setUnstakeMtfmSelectionStatus] =
    useState(false);

  const [unstakeCoftSelectionCount, setUnstakeCoftSelectionCount] = useState(1);
  const [unstakeMtfmSelectionCount, setUnstakeMtfmSelectionCount] = useState(1);

  const [unstakeCoftSelectChecked, setUnstakeCoftSelectChecked] =
    useState(false);
  const [unstakeMtfmSelectChecked, setUnstakeMtfmSelectChecked] =
    useState(false);

  const stakedLegendaryTokenIds = useSelector(
    (state) => state.stakedLegendaryTokenIds
  );

  const unclaimedReward1155 = useSelector((state) => state.unclaimedReward1155);

  async function loadLegendaryData() {
    const { address } = await getCurrentWalletConnected();

    const _legendaryCotfBalance = await legendaryCotfBalanceOf(address);
    dispatch({
      type: "SET_LEGENDARY_COTF_BALANCE",
      payload: _legendaryCotfBalance,
    });
    const _legendaryMtfmBalance = await legendaryMtfmBalanceOf(address);
    dispatch({
      type: "SET_LEGENDARY_MTFM_BALANCE",
      payload: _legendaryMtfmBalance,
    });
  }

  const updateLegendaryStakedData = async () => {
    const { address } = await getCurrentWalletConnected();
    const stakedTokens1155 = await legendariesStaked(address);
    dispatch({
      type: "UPDATE_LEGENDARY_STAKED_TOKENS",
      payload: stakedTokens1155,
    });
  };

  const updateBalance = async () => {
    const { address } = await getCurrentWalletConnected();
    getBalance(address).then((res) =>
      dispatch({
        type: "SET_ACCOUNT_BALANCE",
        payload: parseFloat(toWei(res)).toFixed(2),
      })
    );
  };
  useEffect(() => {
    loadLegendaryData();
    updateLegendaryStakedData();
  }, []);

  const updateUnclaimedLegendariesRewards = async () => {
    const { address } = await getCurrentWalletConnected();
    getLegendariesRewards(address).then((res) => {
      dispatch({
        type: "SET_UNCLAIMED_REWARD1155",
        payload: parseFloat(toWei(res)).toFixed(3),
      });
    });
  };

  const handleUnstake = async () => {
    if (!unstakeMtfmSelectChecked && !unstakeCoftSelectChecked) {
      toast.warn("Please select asset to Unstake");
      return;
    }
    const id = toast.loading("Transaction pending");
    unstakeLegendaries(
      unstakeCoftSelectChecked ? unstakeCoftSelectionCount : 0,
      unstakeMtfmSelectChecked ? unstakeMtfmSelectionCount : 0
    )
      .on("receipt", function (receipt) {
        toast.update(id, {
          render: "Successfully unstaked",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        loadLegendaryData();
        updateLegendaryStakedData();
        setUnstakeCoftSelectionCount(1);
        setUnstakeMtfmSelectionCount(1);
        setUnstakeCoftSelectChecked(false);
        setUnstakeMtfmSelectChecked(false);
        setUnstakeMtfmSelectionStatus(false);
        setUnstakeCoftSelectionStatus(false);
        updateBalance();
        unstakeIdInputRef.current.value = "";
      })
      .on("error", function (error) {
        let errorMessage = "";
        if (error.code === 4001) {
          errorMessage =
            "MetaMask Tx Signature: User denied transaction signature.";
        }
        if (error.code === -32603) {
          errorMessage = "execution reverted: Ownable: caller is not the owner";
        }
        toast.update(id, {
          render: errorMessage || "error found",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleUnstakeAll = async () => {
    if (unstakeCoftSelectChecked || unstakeMtfmSelectChecked) {
      return;
    }

    if (
      parseInt(stakedLegendaryTokenIds.cotfStaked) +
        parseInt(stakedLegendaryTokenIds.mtfmStaked) ===
      0
    ) {
      toast.warning("No asset to unstake");
      return;
    }
    const id = toast.loading("Transaction pending");
    unstakeLegendaries(
      stakedLegendaryTokenIds.cotfStaked,
      stakedLegendaryTokenIds.mtfmStaked
    )
      .on("receipt", function (receipt) {
        toast.update(id, {
          render: "Successfully all staked",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        updateLegendaryStakedData();
        setUnstakeCoftSelectionCount(1);
        setUnstakeMtfmSelectionCount(1);
        setUnstakeCoftSelectChecked(false);
        setUnstakeMtfmSelectChecked(false);
        setUnstakeMtfmSelectionStatus(false);
        setUnstakeCoftSelectionStatus(false);
        updateBalance();
        unstakeIdInputRef.current.value = "";
      })
      .on("error", function (error) {
        let errorMessage = "";
        if (error.code === 4001) {
          errorMessage =
            "MetaMask Tx Signature: User denied transaction signature.";
        }
        if (error.code === -32603) {
          errorMessage = "execution reverted: Ownable: caller is not the owner";
        }
        toast.update(id, {
          render: errorMessage || "error found",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleClaim = () => {
    const id = toast.loading("Transaction pending");
    claimLegendaries()
      .on("receipt", function (receipt) {
        updateUnclaimedLegendariesRewards();
        updateBalance();
        toast.update(id, {
          render: "Successfully claimed reward",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .on("error", function (error) {
        let errorMessage = "";
        if (error.code === 4001) {
          errorMessage =
            "MetaMask Tx Signature: User denied transaction signature.";
        }
        if (error.code === -32603) {
          errorMessage = "execution reverted: Ownable: caller is not the owner";
        }
        toast.update(id, {
          render: errorMessage || "error found",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  return (
    <div className="py-4 block md:hidden">
      <div className="text-center">
        <div className="text-lg mt-8 font-bold px-2">
          {"UNSTAKE YOUR ASSET(S)"}
        </div>
        <div className="text-xxs my-8">
          {"Unstake your asset(s) to stop earning $JUNGLE"}
        </div>
      </div>
      <div className="flex flex-col justify-center items-center bg-yellowOne py-5">
        <div>
          <img src={Images.icons.gorilla} alt="gorilla" />
        </div>

        <div className="text-xl my-2">
          {parseInt(stakedLegendaryTokenIds.cotfStaked) +
            parseInt(stakedLegendaryTokenIds.mtfmStaked)}
          {" Asset(s)"}
        </div>
        <div className="font-poppins text-sm">{"Available to Unstake"}</div>
      </div>
      <div className="xs:py-8 py-3">
        <div className="flex justify-between mb-3 xs:px-8 px-3">
          <div>{"Current Rewards"}</div>
          <div>{unclaimedReward1155}</div>
        </div>
        <div className="text-sm mb-8 font-poppins xs:px-8 px-3">
          {"Select Asset(s) to Unstake:"}
        </div>

        <div className="flex gap-10  xs:px-8 px-3">
          {
            <div className="flex gap-10">
              {stakedLegendaryTokenIds.mtfmStaked > 0 && (
                <div className="cursor-pointer w-32 relative">
                  <div
                    className="relative"
                    onClick={() => {
                      if (!unstakeMtfmSelectChecked)
                        setUnstakeMtfmSelectionStatus(
                          !unstakeMtfmSelectionStatus
                        );
                      if (!unstakeCoftSelectChecked)
                        setUnstakeCoftSelectionStatus(false);
                      unstakeIdInputRef.current.value =
                        unstakeIdInputRef.current.value === LEGENDARY_MTFM_ID
                          ? ""
                          : LEGENDARY_MTFM_ID;
                    }}
                  >
                    <img
                      src={Images.legendary}
                      className={"rounded-20% "}
                      alt="token"
                    />

                    {unstakeMtfmSelectionStatus ? (
                      <div className="absolute h-full w-full bg-black top-0 opacity-50 rounded-20% flex justify-center items-center text-4xl">
                        {unstakeMtfmSelectChecked && <BsCheckCircleFill />}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="text-center">
                    {stakedLegendaryTokenIds.mtfmStaked}
                  </div>
                  <input
                    className="h-10 w-10 checkbox absolute top-0 right-0 cursor-pointer"
                    type="checkbox"
                    checked={unstakeMtfmSelectChecked}
                    onChange={() => {
                      setUnstakeMtfmSelectChecked(!unstakeMtfmSelectChecked);
                      setUnstakeMtfmSelectionStatus(!unstakeMtfmSelectChecked);
                      if (unstakeMtfmSelectChecked)
                        unstakeIdInputRef.current.value = "";
                      else {
                        unstakeIdInputRef.current.value = LEGENDARY_MTFM_ID;
                      }
                    }}
                  />
                </div>
              )}
              {stakedLegendaryTokenIds.cotfStaked > 0 && (
                <div className="cursor-pointer w-32 relative">
                  <div
                    className="relative"
                    onClick={() => {
                      if (!unstakeCoftSelectChecked)
                        setUnstakeCoftSelectionStatus(
                          !unstakeCoftSelectionStatus
                        );
                      if (!unstakeMtfmSelectChecked)
                        setUnstakeMtfmSelectionStatus(false);
                      unstakeIdInputRef.current.value =
                        unstakeIdInputRef.current.value === LEGENDARY_COFT_ID
                          ? ""
                          : LEGENDARY_COFT_ID;
                    }}
                  >
                    <img
                      src={Images.legendaryTwo}
                      className={"rounded-20% "}
                      alt="token"
                    />

                    {unstakeCoftSelectionStatus ? (
                      <div className="absolute h-full w-full bg-black top-0 opacity-50 rounded-20% flex justify-center items-center text-4xl">
                        {unstakeCoftSelectChecked && <BsCheckCircleFill />}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="text-center">
                    {stakedLegendaryTokenIds.cotfStaked}
                  </div>
                  <input
                    className="h-10 w-10 checkbox absolute top-0 right-0 cursor-pointer"
                    type="checkbox"
                    checked={unstakeCoftSelectChecked}
                    onChange={() => {
                      setUnstakeCoftSelectChecked(!unstakeCoftSelectChecked);
                      setUnstakeCoftSelectionStatus(!unstakeCoftSelectChecked);
                      if (unstakeCoftSelectChecked)
                        unstakeIdInputRef.current.value = "";
                      else {
                        unstakeIdInputRef.current.value = LEGENDARY_COFT_ID;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          }
        </div>

        <div className="xs:px-8 px-3">
          <div className="text-sm mt-6">{"ASSET ID(S)"}</div>
          <input
            className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
            ref={unstakeIdInputRef}
            disabled
          />
          <div className="text-sm mt-6">{"Amount"}</div>
          {unstakeMtfmSelectionStatus &&
            !unstakeMtfmSelectChecked &&
            !unstakeCoftSelectChecked && (
              <input
                className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
                value={unstakeMtfmSelectionCount}
                onChange={(ev) => setUnstakeMtfmSelectionCount(ev.target.value)}
                max={stakedLegendaryTokenIds.mtfmStaked}
                min="1"
                type="number"
                placeholder={`available: ${stakedLegendaryTokenIds.mtfmStaked}`}
                readOnly={unstakeMtfmSelectChecked}
              />
            )}

          {unstakeCoftSelectionStatus &&
            !unstakeCoftSelectChecked &&
            !unstakeMtfmSelectChecked && (
              <input
                className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
                value={unstakeCoftSelectionCount}
                onChange={(ev) => setUnstakeCoftSelectionCount(ev.target.value)}
                max={stakedLegendaryTokenIds.cotfStaked}
                min="1"
                type="number"
                placeholder={`available: ${stakedLegendaryTokenIds.cotfStaked}`}
                readOnly={unstakeCoftSelectChecked}
              />
            )}

          {((!unstakeCoftSelectionStatus && !unstakeMtfmSelectionStatus) ||
            unstakeMtfmSelectChecked ||
            unstakeCoftSelectChecked) && (
            <input
              className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
              placeholder={
                unstakeCoftSelectChecked && unstakeMtfmSelectChecked
                  ? `Selection finished. you are going to unstake ${unstakeMtfmSelectionCount} MTFM + ${unstakeCoftSelectionCount} COFT`
                  : unstakeCoftSelectChecked
                  ? `Selection finished. you are going to unstake ${unstakeCoftSelectionCount} COFT`
                  : unstakeMtfmSelectChecked
                  ? `Selection finished. you are going to unstake ${unstakeMtfmSelectionCount} MTFM
                  `
                  : "Please select and check asset(s)"
              }
              readOnly
            />
          )}

          <div className="flex justify-between xs:text-xs text-xxs ">
            <div className="">{"Quantity"}</div>
            <div>
              {"Untaking "}
              {(unstakeMtfmSelectChecked
                ? parseInt(unstakeMtfmSelectionCount)
                : 0) +
                (unstakeCoftSelectChecked
                  ? parseInt(unstakeCoftSelectionCount)
                  : 0)}
              {" Asset(s)"}
            </div>
          </div>
          <div className="flex justify-between xs:text-xs text-xxs  mt-4 mb-9">
            <div>{"Legendary Rewards Decrease"}</div>
            <div>
              <span className="text-primary">
                {unstakeMtfmSelectionCount === 0 &&
                unstakeCoftSelectionCount === 0
                  ? "0"
                  : "-" +
                    parseInt(
                      (unstakeMtfmSelectChecked
                        ? parseInt(unstakeMtfmSelectionCount)
                        : 0) *
                        15 +
                        (unstakeCoftSelectChecked
                          ? parseInt(unstakeCoftSelectionCount)
                          : 0) *
                          35
                    )}
                {" $JUNGLE"}
              </span>
              {"/ day"}
            </div>
          </div>
          <button
            className="bg-primary w-full rounded-xl py-2"
            onClick={handleUnstake}
          >
            {"CONFIRM AND UNSTAKE"}
          </button>
          <button
            onClick={handleUnstakeAll}
            className={
              "w-full rounded-xl py-2 mt-2 " +
              (!unstakeMtfmSelectChecked &&
              !unstakeCoftSelectChecked &&
              parseInt(stakedLegendaryTokenIds.cotfStaked) +
                parseInt(stakedLegendaryTokenIds.mtfmStaked) >
                0
                ? "bg-third cursor-pointer"
                : "bg-disabled cursor-not-allowed")
            }
          >
            {"UNSTAKE ALL"}
          </button>
          <button
            onClick={handleClaim}
            className="bg-fifth w-full rounded-xl py-2 mt-2"
          >
            {"CLAIM REWARD"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLegendaryUnstake;
